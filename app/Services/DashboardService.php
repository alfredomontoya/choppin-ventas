<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\OrdenCompra;
use App\Models\Producto;
use App\Models\Venta;

class DashboardService
{
    public function obtenerResumen(): array
    {
        $hoy = now()->startOfDay();
        $ayer = now()->subDay()->startOfDay();

        $ventasHoy = Venta::whereDate('fecha_emision', $hoy)->where('estado', 'completado');
        $ventasAyer = Venta::whereDate('fecha_emision', $ayer)->where('estado', 'completado');

        $cantHoy = $ventasHoy->count();
        $cantAyer = $ventasAyer->count();
        $ingresosHoy = (float) $ventasHoy->sum('total');
        $ingresosAyer = (float) $ventasAyer->sum('total');

        return [
            'ventas_hoy' => $cantHoy,
            'ventas_trend' => $cantAyer > 0 ? round((($cantHoy - $cantAyer) / $cantAyer) * 100) : 0,
            'ingresos_hoy' => $ingresosHoy,
            'ingresos_trend' => $ingresosAyer > 0 ? round((($ingresosHoy - $ingresosAyer) / $ingresosAyer) * 100) : 0,
            'productos_agotados' => Producto::where('stock_actual', '<=', 0)->where('activo', true)->count(),
            'ordenes_pendientes' => OrdenCompra::where('estado', 'pendiente')->count(),
            'ingresos_semana' => $this->ingresosSemana(),
            'ventas_recientes' => Venta::with('cliente', 'user')
                ->where('estado', 'completado')
                ->latest('fecha_emision')
                ->limit(5)
                ->get(),
            'stock_bajo' => Producto::whereColumn('stock_actual', '<=', 'stock_minimo')
                ->where('activo', true)
                ->orderBy('stock_actual')
                ->limit(10)
                ->get(),
        ];
    }

    private function ingresosSemana(): array
    {
        return collect(range(6, 0, -1))->map(function (int $daysAgo) {
            $fecha = now()->subDays($daysAgo)->startOfDay();

            return [
                'fecha' => str_replace('.', '', $fecha->isoFormat('ddd D')),
                'total' => (float) Venta::whereDate('fecha_emision', $fecha)
                    ->where('estado', 'completado')
                    ->sum('total'),
            ];
        })->toArray();
    }
}
