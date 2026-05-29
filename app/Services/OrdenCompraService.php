<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\TipoMovimientoStock;
use App\Models\DetalleOrdenCompra;
use App\Models\OrdenCompra;

class OrdenCompraService
{
    public function __construct(
        private readonly StockService $stockService,
    ) {}

    public function recibirOrden(OrdenCompra $ordenCompra): OrdenCompra
    {
        if ($ordenCompra->estado !== 'pendiente') {
            throw new \RuntimeException('La orden de compra ya fue procesada');
        }

        return \DB::transaction(function () use ($ordenCompra) {
            $ordenCompra->update(['estado' => 'recibido']);

            $detalles = $ordenCompra->detalle()->with('producto')->get();

            foreach ($detalles as $detalle) {
                $this->stockService->registrarMovimiento(
                    producto: $detalle->producto,
                    tipo: TipoMovimientoStock::IngresoCompra,
                    cantidad: $detalle->cantidad,
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
        $igvRate = 0.18;
        $subtotal = 0;

        $detallesData = [];
        foreach ($detalles as $item) {
            $producto = \App\Models\Producto::findOrFail($item['producto_id']);
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

        $igv = $subtotal * $igvRate;
        $total = $subtotal + $igv;

        return \DB::transaction(function () use ($detallesData, $proveedorId, $tipoComprobante, $observaciones, $subtotal, $igv, $total) {
            $orden = OrdenCompra::create([
                'proveedor_id' => $proveedorId,
                'user_id' => auth()->id(),
                'numero_comprobante' => $this->generarComprobante(),
                'tipo_comprobante' => $tipoComprobante,
                'fecha_emision' => now(),
                'subtotal' => $subtotal,
                'igv' => $igv,
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
        return 'OC-' . str_pad((string)($ultimo + 1), 8, '0', STR_PAD_LEFT);
    }
}
