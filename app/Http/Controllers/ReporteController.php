<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\OrdenCompra;
use App\Models\Producto;
use App\Models\Venta;
use App\Services\ReporteService;
use Illuminate\Http\Request;

class ReporteController extends Controller
{
    public function __construct(
        protected ReporteService $service
    ) {}

    public function index()
    {
        return inertia('Reportes/Index');
    }

    public function ventas(Request $request)
    {
        $result = $this->service->ventas($request);

        return inertia('Reportes/Ventas', [
            'data' => $result['data'],
            'resumen' => $result['resumen'],
            'filtros' => $request->only([
                'fecha_desde', 'fecha_hasta', 'tipo_pago',
                'tipo_comprobante', 'cliente_id',
                'por_pagina', 'page',
            ]),
        ]);
    }

    public function compras(Request $request)
    {
        $result = $this->service->compras($request);

        return inertia('Reportes/Compras', [
            'data' => $result['data'],
            'resumen' => $result['resumen'],
            'filtros' => $request->only([
                'fecha_desde', 'fecha_hasta', 'proveedor_id', 'estado',
                'por_pagina', 'page',
            ]),
        ]);
    }

    public function rentabilidad(Request $request)
    {
        $result = $this->service->rentabilidad($request);

        return inertia('Reportes/Rentabilidad', [
            'data' => $result['data'],
            'resumen' => $result['resumen'],
            'filtros' => $request->only([
                'fecha_desde', 'fecha_hasta', 'busqueda',
                'orden', 'direccion',
                'por_pagina', 'page',
            ]),
        ]);
    }

    public function movimientos(Request $request)
    {
        $result = $this->service->movimientos($request);

        return inertia('Reportes/Movimientos', [
            'data' => $result['data'],
            'resumen' => $result['resumen'],
            'filtros' => $request->only([
                'fecha_desde', 'fecha_hasta', 'tipo', 'producto_id',
                'por_pagina', 'page',
            ]),
        ]);
    }

    public function clientes(Request $request)
    {
        $result = $this->service->clientes($request);

        return inertia('Reportes/Clientes', [
            'data' => $result['data'],
            'resumen' => $result['resumen'],
            'filtros' => $request->only([
                'fecha_desde', 'fecha_hasta', 'busqueda',
                'orden', 'direccion',
                'por_pagina', 'page',
            ]),
        ]);
    }

    public function notificaciones()
    {
        $stockBajo = Producto::whereColumn('stock_actual', '<=', 'stock_minimo')
            ->where('activo', true)
            ->count();

        $ordenesPendientes = OrdenCompra::where('estado', 'pendiente')->count();

        $ventasAnuladasHoy = Venta::whereDate('fecha_emision', today())
            ->where('estado', 'anulado')
            ->count();

        return response()->json([
            'stock_bajo' => $stockBajo,
            'ordenes_pendientes' => $ordenesPendientes,
            'ventas_anuladas_hoy' => $ventasAnuladasHoy,
            'total' => $stockBajo + $ordenesPendientes + $ventasAnuladasHoy,
        ]);
    }
}
