<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\TipoMovimientoStock;
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
        return Venta::with('cliente', 'user')
            ->applyFilters($request)
            ->applySorting($request)
            ->paginate($request->input('por_pagina', 10))
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
    ): Venta {
        $igvRate = 0.00;
        $subtotal = 0;

        $detallesData = [];
        foreach ($detalles as $item) {
            $producto = Producto::findOrFail($item['producto_id']);
            $vigente = $producto->precios()
                ->whereDate('fecha_inicio', '<=', now())
                ->where(function ($q) {
                    $q->whereNull('fecha_fin')->orWhereDate('fecha_fin', '>=', now());
                })
                ->latest('fecha_inicio')
                ->first();
            $precio = $vigente?->precio_venta ?? 0;
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

        $igv = ($subtotal - $descuento) * $igvRate;
        $total = $subtotal - $descuento + $igv;

        return \DB::transaction(function () use ($detallesData, $tipoComprobante, $tipoPago, $clienteId, $descuento, $montoRecibido, $cambio, $observaciones, $subtotal, $igv, $total) {
            $venta = Venta::create([
                'user_id' => auth()->id(),
                'cliente_id' => $clienteId,
                'numero_comprobante' => $this->generarComprobante($tipoComprobante),
                'tipo_comprobante' => $tipoComprobante,
                'fecha_emision' => now(),
                'subtotal' => $subtotal,
                'igv' => $igv,
                'descuento' => $descuento,
                'total' => $total,
                'monto_recibido' => $montoRecibido,
                'cambio' => $cambio,
                'tipo_pago' => $tipoPago,
                'observaciones' => $observaciones,
                'estado' => 'completado',
            ]);

            foreach ($detallesData as $detalle) {
                $detalle['venta_id'] = $venta->id;
                DetalleVenta::create($detalle);

                $producto = Producto::find($detalle['producto_id']);
                $this->stockService->registrarMovimiento(
                    producto: $producto,
                    tipo: TipoMovimientoStock::EgresoVenta,
                    cantidad: $detalle['cantidad'],
                    motivo: "Venta #{$venta->numero_comprobante}",
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
            $venta = $this->obtenerPorId($id);

            if ($venta->estado === 'anulado') {
                throw new \RuntimeException('La venta ya se encuentra anulada.');
            }

            $venta->update(['estado' => 'anulado']);

            foreach ($venta->detalle as $detalle) {
                $producto = Producto::find($detalle->producto_id);
                $this->stockService->registrarMovimiento(
                    producto: $producto,
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
            ->applyFilters($request);
    }

    private function generarComprobante(string $tipo): string
    {
        $prefix = match ($tipo) {
            'boleta' => 'B',
            'factura' => 'F',
            default => 'V',
        };

        $ultimo = Venta::where('tipo_comprobante', $tipo)
            ->withTrashed()
            ->count();

        return $prefix . '-' . str_pad((string)($ultimo + 1), 8, '0', STR_PAD_LEFT);
    }
}
