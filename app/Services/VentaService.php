<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\TipoMovimientoStock;
use App\Models\Correlativo;
use App\Models\DetalleVenta;
use App\Models\Producto;
use App\Models\Venta;
use Illuminate\Http\Request;

class VentaService
{
    public function __construct(
        private readonly StockService $stockService,
    ) {}

    public function listar(Request $request)
    {
        $porPagina = $request->input('por_pagina');

        if (! $porPagina) {
            $porPagina = 10;
        }

        return Venta::with('cliente', 'user')
            ->applyFilters($request)
            ->applySorting($request)
            ->paginate((int) $porPagina)
            ->withQueryString();
    }

    public function obtenerPorId(int $id): Venta
    {
        return Venta::with(['cliente', 'user', 'detalle.producto'])->findOrFail($id);
    }

    public function registrarVenta(
        array $detalles,
        string $tipoComprobante,
        string $tipoPago,
        ?int $clienteId = null,
        float $descuento = 0,
        ?float $montoRecibido = null,
        ?float $cambio = null,
        ?string $observaciones = null,
        bool $conIva = true,
    ): Venta {
        $ivaRate = (float) config('ventas.iva_rate', 0.13);
        $subtotal = 0;

        $productosIds = array_column($detalles, 'producto_id');
        $productos = Producto::with('precios')->findMany($productosIds);
        $productosMap = $productos->keyBy('id');

        $detallesData = [];
        foreach ($detalles as $item) {
            $producto = $productosMap->get($item['producto_id']);
            if (! $producto) {
                throw new \RuntimeException("Producto ID {$item['producto_id']} no encontrado.");
            }

            $vigente = $producto->precios
                ->filter(fn ($p) => $p->fecha_inicio->startOfDay()->lte(now()) && (! $p->fecha_fin || $p->fecha_fin->startOfDay()->gte(now())))
                ->sortByDesc('fecha_inicio')
                ->first();

            if (! $vigente) {
                throw new \RuntimeException("El producto {$producto->nombre} no tiene precio de venta configurado.");
            }

            $precio = $vigente->precio_venta;
            $cantidad = (float) $item['cantidad'];

            if ($producto->stock_actual < $cantidad) {
                throw new \RuntimeException("Stock insuficiente para {$producto->nombre}");
            }

            $itemSubtotal = $precio * $cantidad;
            $subtotal += $itemSubtotal;

            $detallesData[] = [
                'producto_id' => $producto->id,
                'cantidad' => $cantidad,
                'precio_unitario' => $precio,
                'descuento' => 0,
                'subtotal' => $itemSubtotal,
            ];
        }

        $iva = $conIva ? ($subtotal - $descuento) * $ivaRate : 0;
        $total = $subtotal - $descuento + $iva;

        return \DB::transaction(function () use ($detallesData, $productosMap, $tipoComprobante, $tipoPago, $clienteId, $descuento, $montoRecibido, $cambio, $observaciones, $subtotal, $iva, $total, $conIva) {
            $numeroComprobante = $this->generarComprobante($tipoComprobante);

            $venta = Venta::create([
                'user_id' => auth()->id(),
                'cliente_id' => $clienteId,
                'numero_comprobante' => $numeroComprobante,
                'tipo_comprobante' => $tipoComprobante,
                'fecha_emision' => now(),
                'subtotal' => $subtotal,
                'iva' => $iva,
                'con_iva' => $conIva,
                'descuento' => $descuento,
                'total' => $total,
                'monto_recibido' => $montoRecibido,
                'cambio' => $cambio,
                'tipo_pago' => $tipoPago,
                'observaciones' => $observaciones,
                'estado' => 'completado',
            ]);

            $detallesInsert = [];
            foreach ($detallesData as $detalle) {
                $detallesInsert[] = [
                    'venta_id' => $venta->id,
                    'producto_id' => $detalle['producto_id'],
                    'cantidad' => $detalle['cantidad'],
                    'precio_unitario' => $detalle['precio_unitario'],
                    'descuento' => $detalle['descuento'],
                    'subtotal' => $detalle['subtotal'],
                    'created_by' => $venta->created_by,
                    'updated_by' => $venta->updated_by,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            DetalleVenta::insert($detallesInsert);

            foreach ($detallesData as $detalle) {
                $producto = $productosMap->get($detalle['producto_id']);
                $this->stockService->registrarMovimiento(
                    producto: $producto,
                    tipo: TipoMovimientoStock::EgresoVenta,
                    cantidad: $detalle['cantidad'],
                    motivo: "Venta #{$numeroComprobante}",
                    referencia: $venta,
                );
            }

            return $venta->load('detalle.producto', 'cliente', 'user');
        });
    }

    public function actualizar(int $id, array $data): Venta
    {
        $venta = $this->obtenerPorId($id);
        $venta->update($data);

        return $venta;
    }

    public function anular(int $id): Venta
    {
        return \DB::transaction(function () use ($id) {
            $venta = Venta::with(['detalle.producto', 'cliente', 'user'])->lockForUpdate()->findOrFail($id);

            if ($venta->estado === 'anulado') {
                throw new \RuntimeException('La venta ya se encuentra anulada.');
            }

            $venta->update(['estado' => 'anulado']);

            foreach ($venta->detalle as $detalle) {
                $this->stockService->registrarMovimiento(
                    producto: $detalle->producto,
                    tipo: TipoMovimientoStock::IngresoAnulacion,
                    cantidad: $detalle->cantidad,
                    motivo: "Anulación Venta #{$venta->numero_comprobante}",
                    referencia: $venta,
                );
            }

            return $venta->load('detalle.producto', 'cliente', 'user');
        });
    }

    public function eliminar(int $id): void
    {
        $venta = $this->obtenerPorId($id);
        $venta->delete();
    }

    public function queryParaExportar(Request $request)
    {
        return Venta::with('cliente', 'user')
            ->applyFilters($request)
            ->applySorting($request);
    }

    private function generarComprobante(string $tipo): string
    {
        $prefix = match ($tipo) {
            'boleta' => 'B',
            'factura' => 'F',
            default => 'V',
        };

        $correlativo = Correlativo::where('tipo', $tipo)->lockForUpdate()->firstOrFail();
        $currentYear = (int) now()->year;

        if ($correlativo->reiniciar_anual && $correlativo->year !== $currentYear) {
            $ultimoAnterior = $correlativo->ultimo;
            $correlativo->ultimo = 0;
            $correlativo->year = $currentYear;
            $correlativo->ultimo_reset_en = now();
            $correlativo->save();

            $correlativo->resets()->create([
                'tipo' => $correlativo->tipo,
                'ultimo_anterior' => $ultimoAnterior,
                'user_id' => auth()->id(),
                'glosa' => "Reinicio automático por cambio de año ({$currentYear}).",
            ]);
        }

        $correlativo->increment('ultimo');

        if ($correlativo->year === null) {
            $correlativo->year = $currentYear;
            $correlativo->save();
        }

        return $prefix . '-' . $correlativo->year . '-' . str_pad((string) $correlativo->ultimo, 8, '0', STR_PAD_LEFT);
    }
}
