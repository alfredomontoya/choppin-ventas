<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\PrecioProducto;
use App\Models\Producto;

class PrecioService
{
    public function getPrecioVigente(Producto $producto, ?string $fecha = null): ?PrecioProducto
    {
        $fecha = $fecha ?? now()->format('Y-m-d');

        return $producto->precios()
            ->where('fecha_inicio', '<=', $fecha)
            ->where(function ($q) use ($fecha) {
                $q->where('fecha_fin', '>=', $fecha)
                    ->orWhereNull('fecha_fin');
            })
            ->latest('fecha_inicio')
            ->first();
    }

    public function crearPrecio(Producto $producto, float $precioCompra, float $precioVenta, string $fechaInicio, ?string $fechaFin = null): PrecioProducto
    {
        return $producto->precios()->create([
            'precio_compra' => $precioCompra,
            'precio_venta' => $precioVenta,
            'fecha_inicio' => $fechaInicio,
            'fecha_fin' => $fechaFin,
        ]);
    }
}
