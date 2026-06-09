<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\TipoMovimientoStock;
use App\Models\DetalleOrdenCompra;
use App\Models\OrdenCompra;
use App\Models\PrecioProducto;
use App\Models\Producto;
use Illuminate\Http\Request;

class OrdenCompraService
{
    public function __construct(
        private readonly StockService $stockService,
    ) {}

    public function listar(Request $request)
    {
        return OrdenCompra::with('proveedor', 'user')
            ->applyFilters($request)
            ->applySorting($request)
            ->paginate($request->input('por_pagina', 10))
            ->withQueryString();
    }

    public function obtenerPorId(int $id): OrdenCompra
    {
        return OrdenCompra::with(['proveedor', 'user', 'detalle.producto'])->findOrFail($id);
    }

    public function actualizar(int $id, array $data): OrdenCompra
    {
        $orden = $this->obtenerPorId($id);
        $orden->update($data);

        return $orden;
    }

    public function eliminar(int $id): void
    {
        $orden = $this->obtenerPorId($id);
        $orden->delete();
    }

    public function queryParaExportar(Request $request)
    {
        return OrdenCompra::with('proveedor', 'user')
            ->applyFilters($request);
    }

    public function obtenerDiscrepanciasPrecios(OrdenCompra $ordenCompra): array
    {
        $discrepancias = [];

        foreach ($ordenCompra->detalle as $detalle) {
            $producto = $detalle->producto;

            $precioActual = PrecioProducto::where('producto_id', $producto->id)
                ->where(fn ($q) => $q->whereNull('fecha_fin')->orWhere('fecha_fin', '>=', now()->format('Y-m-d')))
                ->latest('fecha_inicio')
                ->first();

            if (! $precioActual) {
                continue;
            }

            $precioCompraActual = (float) $precioActual->precio_compra;
            $precioUnitario = (float) $detalle->precio_unitario;
            $margen = (float) ($producto->margen_utilidad ?? 30);

            if (abs($precioCompraActual - $precioUnitario) > 0.01) {
                $discrepancias[] = [
                    'producto_id' => $producto->id,
                    'producto_nombre' => "{$producto->codigo} — {$producto->nombre}",
                    'precio_compra_actual' => $precioCompraActual,
                    'precio_venta_actual' => (float) $precioActual->precio_venta,
                    'precio_unitario_orden' => $precioUnitario,
                    'margen_utilidad' => $margen,
                    'nuevo_precio_venta_sugerido' => round($precioUnitario * (1 + $margen / 100), 2),
                ];
            }
        }

        return $discrepancias;
    }

    public function recibirOrden(OrdenCompra $ordenCompra, ?array $actualizarPrecios = null): OrdenCompra
    {
        if ($ordenCompra->estado !== 'pendiente') {
            throw new \RuntimeException('La orden de compra ya fue procesada');
        }

        return \DB::transaction(function () use ($ordenCompra, $actualizarPrecios) {
            $ordenCompra->update(['estado' => 'recibido']);

            if ($actualizarPrecios) {
                foreach ($actualizarPrecios as $item) {
                    $precioActual = PrecioProducto::where('producto_id', $item['producto_id'])
                        ->whereNull('fecha_fin')
                        ->latest('fecha_inicio')
                        ->first();

                    if ($precioActual) {
                        $precioActual->update(['fecha_fin' => now()->subDay()->format('Y-m-d')]);
                    }

                    PrecioProducto::create([
                        'producto_id' => $item['producto_id'],
                        'precio_compra' => $item['precio_compra'],
                        'precio_venta' => $item['precio_venta'],
                        'fecha_inicio' => now()->format('Y-m-d'),
                    ]);
                }
            }

            $detalles = $ordenCompra->detalle()->with('producto')->get();

            foreach ($detalles as $detalle) {
                $this->stockService->registrarMovimiento(
                    producto: $detalle->producto,
                    tipo: TipoMovimientoStock::IngresoCompra,
                    cantidad: (float) $detalle->cantidad,
                    motivo: "Orden de compra #{$ordenCompra->numero_comprobante}",
                    referencia: $ordenCompra,
                );
            }

            return $ordenCompra->fresh()->load('detalle.producto');
        });
    }

    public function crearOrden(
        int $proveedorId,
        string $tipoComprobante,
        array $detalles,
        ?string $observaciones = null,
    ): OrdenCompra {
        $ivaRate = 0.18;
        $subtotal = 0;

        $detallesData = [];
        foreach ($detalles as $item) {
            $producto = Producto::findOrFail($item['producto_id']);
            $cantidad = $item['cantidad'];
            $precio = $item['precio_unitario'];
            $itemSubtotal = $precio * $cantidad;
            $subtotal += $itemSubtotal;

            $detallesData[] = [
                'producto_id' => $producto->id,
                'cantidad' => $cantidad,
                'precio_unitario' => $precio,
                'subtotal' => $itemSubtotal,
            ];
        }

        $iva = $subtotal * $ivaRate;
        $total = $subtotal + $iva;

        return \DB::transaction(function () use ($detallesData, $proveedorId, $tipoComprobante, $observaciones, $subtotal, $iva, $total) {
            $orden = OrdenCompra::create([
                'proveedor_id' => $proveedorId,
                'user_id' => auth()->id(),
                'numero_comprobante' => $this->generarComprobante(),
                'tipo_comprobante' => $tipoComprobante,
                'fecha_emision' => now(),
                'subtotal' => $subtotal,
                'iva' => $iva,
                'total' => $total,
                'observaciones' => $observaciones,
                'estado' => 'pendiente',
            ]);

            foreach ($detallesData as $detalle) {
                $detalle['orden_compra_id'] = $orden->id;
                DetalleOrdenCompra::create($detalle);
            }

            return $orden->load('detalle.producto');
        });
    }

    private function generarComprobante(): string
    {
        $ultimo = OrdenCompra::withTrashed()->count();

        return 'OC-' . str_pad((string) ($ultimo + 1), 8, '0', STR_PAD_LEFT);
    }
}
