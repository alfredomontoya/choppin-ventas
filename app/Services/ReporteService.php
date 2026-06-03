<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Cliente;
use App\Models\DetalleVenta;
use App\Models\MovimientoStock;
use App\Models\OrdenCompra;
use App\Models\Venta;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class ReporteService
{
    public function ventas(Request $request): array
    {
        $query = Venta::with('cliente', 'user')
            ->where('estado', 'completado');

        if ($fechaDesde = $request->input('fecha_desde')) {
            $query->whereDate('fecha_emision', '>=', $fechaDesde);
        }
        if ($fechaHasta = $request->input('fecha_hasta')) {
            $query->whereDate('fecha_emision', '<=', $fechaHasta);
        }
        if ($tipoPago = $request->input('tipo_pago')) {
            $query->where('tipo_pago', $tipoPago);
        }
        if ($tipoComprobante = $request->input('tipo_comprobante')) {
            $query->where('tipo_comprobante', $tipoComprobante);
        }
        if ($clienteId = $request->input('cliente_id')) {
            $query->where('cliente_id', $clienteId);
        }

        $query->orderByDesc('fecha_emision');

        $resumenQuery = clone $query;

        $perPage = (int) ($request->input('por_pagina', 50));
        $page = (int) ($request->input('page', 1));

        $total = $query->count();
        $items = $query->skip(($page - 1) * $perPage)->take($perPage)->get();

        $resumen = [
            'total_ventas' => $total,
            'subtotal' => (float) $resumenQuery->sum('subtotal'),
            'igv' => (float) $resumenQuery->sum('igv'),
            'descuento' => (float) $resumenQuery->sum('descuento'),
            'total_ingresos' => (float) $resumenQuery->sum('total'),
        ];

        $paginator = new LengthAwarePaginator(
            $items,
            $total,
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()],
        );

        return [
            'data' => $paginator,
            'resumen' => $resumen,
        ];
    }

    public function compras(Request $request): array
    {
        $query = OrdenCompra::with('proveedor', 'user');

        if ($fechaDesde = $request->input('fecha_desde')) {
            $query->whereDate('fecha_emision', '>=', $fechaDesde);
        }
        if ($fechaHasta = $request->input('fecha_hasta')) {
            $query->whereDate('fecha_emision', '<=', $fechaHasta);
        }
        if ($proveedorId = $request->input('proveedor_id')) {
            $query->where('proveedor_id', $proveedorId);
        }
        if ($estado = $request->input('estado')) {
            $query->where('estado', $estado);
        }

        $query->orderByDesc('fecha_emision');

        $resumenQuery = clone $query;

        $perPage = (int) ($request->input('por_pagina', 50));
        $page = (int) ($request->input('page', 1));

        $total = $query->count();
        $items = $query->skip(($page - 1) * $perPage)->take($perPage)->get();

        $resumen = [
            'total_compras' => $total,
            'subtotal' => (float) $resumenQuery->sum('subtotal'),
            'igv' => (float) $resumenQuery->sum('igv'),
            'total_gastos' => (float) $resumenQuery->sum('total'),
        ];

        $paginator = new LengthAwarePaginator(
            $items,
            $total,
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()],
        );

        return [
            'data' => $paginator,
            'resumen' => $resumen,
        ];
    }

    public function rentabilidad(Request $request): array
    {
        $query = DetalleVenta::query()
            ->selectRaw('
                detalle_ventas.producto_id,
                productos.nombre,
                productos.codigo,
                categoria_productos.nombre as categoria_nombre,
                SUM(detalle_ventas.cantidad) as cantidad_vendida,
                AVG(detalle_ventas.precio_unitario) as precio_promedio,
                SUM(detalle_ventas.subtotal) as ingreso_total,
                AVG(detalle_ventas.precio_unitario - COALESCE((
                    SELECT pp.precio_compra
                    FROM precio_productos pp
                    WHERE pp.producto_id = detalle_ventas.producto_id
                        AND pp.fecha_inicio <= DATE(detalle_ventas.created_at)
                        AND (pp.fecha_fin IS NULL OR pp.fecha_fin >= DATE(detalle_ventas.created_at))
                    ORDER BY pp.fecha_inicio DESC
                    LIMIT 1
                ), 0)) as ganancia_promedio
            ')
            ->join('productos', 'productos.id', '=', 'detalle_ventas.producto_id')
            ->leftJoin('categoria_productos', 'categoria_productos.id', '=', 'productos.categoria_id')
            ->join('ventas', 'ventas.id', '=', 'detalle_ventas.venta_id')
            ->where('ventas.estado', 'completado');

        if ($fechaDesde = $request->input('fecha_desde')) {
            $query->whereDate('ventas.fecha_emision', '>=', $fechaDesde);
        }
        if ($fechaHasta = $request->input('fecha_hasta')) {
            $query->whereDate('ventas.fecha_emision', '<=', $fechaHasta);
        }

        $query->groupBy(
            'detalle_ventas.producto_id',
            'productos.nombre',
            'productos.codigo',
            'categoria_productos.nombre',
        );

        $search = $request->input('busqueda');
        if ($search) {
            $query->having('productos.nombre', 'like', "%{$search}%");
        }

        $orden = $request->input('orden', 'cantidad_vendida');
        $direccion = $request->input('direccion', 'desc');
        $query->orderBy($orden, $direccion);

        $perPage = (int) ($request->input('por_pagina', 50));
        $page = (int) ($request->input('page', 1));

        $total = $query->get()->count();
        $items = $query->skip(($page - 1) * $perPage)->take($perPage)->get();

        $items = $items->map(function ($item) {
            $gananciaPromedio = (float) $item->ganancia_promedio;
            $precioPromedio = (float) $item->precio_promedio;
            $cantidadVendida = (float) $item->cantidad_vendida;
            $ingresoTotal = (float) $item->ingreso_total;
            $costoTotal = ($precioPromedio - $gananciaPromedio) * $cantidadVendida;
            $gananciaTotal = $ingresoTotal - $costoTotal;
            $margen = $precioPromedio > 0 ? ($gananciaPromedio / $precioPromedio) * 100 : 0;

            return [
                'producto_id' => $item->producto_id,
                'nombre' => $item->nombre,
                'codigo' => $item->codigo,
                'categoria' => $item->categoria_nombre,
                'cantidad_vendida' => $cantidadVendida,
                'precio_promedio' => round($precioPromedio, 2),
                'ingreso_total' => round($ingresoTotal, 2),
                'costo_total' => round($costoTotal, 2),
                'ganancia_total' => round($gananciaTotal, 2),
                'margen' => round($margen, 1),
            ];
        });

        $resumenQuery = DetalleVenta::query()
            ->selectRaw('
                SUM(detalle_ventas.subtotal) as ingreso_total,
                SUM(detalle_ventas.cantidad) as total_productos
            ')
            ->join('ventas', 'ventas.id', '=', 'detalle_ventas.venta_id')
            ->where('ventas.estado', 'completado');

        if ($fechaDesde = $request->input('fecha_desde')) {
            $resumenQuery->whereDate('ventas.fecha_emision', '>=', $fechaDesde);
        }
        if ($fechaHasta = $request->input('fecha_hasta')) {
            $resumenQuery->whereDate('ventas.fecha_emision', '<=', $fechaHasta);
        }
        $resumenData = $resumenQuery->first();

        $resumen = [
            'total_productos_vendidos' => (float) ($resumenData->total_productos ?? 0),
            'ingreso_total' => (float) ($resumenData->ingreso_total ?? 0),
            'productos_distintos' => $items->count() > 0
                ? DetalleVenta::join('ventas', 'ventas.id', '=', 'detalle_ventas.venta_id')
                    ->where('ventas.estado', 'completado')
                    ->distinct('detalle_ventas.producto_id')
                    ->count('detalle_ventas.producto_id')
                : 0,
        ];

        $paginator = new LengthAwarePaginator(
            $items,
            $total,
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()],
        );

        return [
            'data' => $paginator,
            'resumen' => $resumen,
        ];
    }

    public function movimientos(Request $request): array
    {
        $query = MovimientoStock::with('producto', 'user');

        if ($fechaDesde = $request->input('fecha_desde')) {
            $query->whereDate('created_at', '>=', $fechaDesde);
        }
        if ($fechaHasta = $request->input('fecha_hasta')) {
            $query->whereDate('created_at', '<=', $fechaHasta);
        }
        if ($tipo = $request->input('tipo')) {
            $query->where('tipo', $tipo);
        }
        if ($productoId = $request->input('producto_id')) {
            $query->where('producto_id', $productoId);
        }

        $query->orderByDesc('created_at');

        $resumenQuery = clone $query;

        $perPage = (int) ($request->input('por_pagina', 50));
        $page = (int) ($request->input('page', 1));

        $total = $query->count();
        $items = $query->skip(($page - 1) * $perPage)->take($perPage)->get();

        $resumen = [
            'total_movimientos' => $total,
            'ingresos' => (float) $resumenQuery->clone()->whereIn('tipo', ['ingreso_compra', 'ingreso_manual', 'ingreso_anulacion'])->sum('cantidad'),
            'egresos' => (float) $resumenQuery->clone()->whereIn('tipo', ['egreso_venta', 'egreso_manual'])->sum('cantidad'),
        ];

        $paginator = new LengthAwarePaginator(
            $items,
            $total,
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()],
        );

        return [
            'data' => $paginator,
            'resumen' => $resumen,
        ];
    }

    public function clientes(Request $request): array
    {
        $query = Cliente::query()
            ->selectRaw('
                clientes.id,
                clientes.nombre,
                clientes.nombre,
                clientes.tipo_documento,
                clientes.numero_documento,
                clientes.telefono,
                clientes.email,
                COUNT(ventas.id) as total_compras,
                COALESCE(SUM(ventas.total), 0) as monto_total,
                COALESCE(AVG(ventas.total), 0) as promedio_compra,
                MAX(ventas.fecha_emision) as ultima_compra
            ')
            ->join('ventas', 'ventas.cliente_id', '=', 'clientes.id')
            ->where('ventas.estado', 'completado');

        if ($fechaDesde = $request->input('fecha_desde')) {
            $query->whereDate('ventas.fecha_emision', '>=', $fechaDesde);
        }
        if ($fechaHasta = $request->input('fecha_hasta')) {
            $query->whereDate('ventas.fecha_emision', '<=', $fechaHasta);
        }

        $query->groupBy(
            'clientes.id',
            'clientes.nombre',
            'clientes.nombre',
            'clientes.tipo_documento',
            'clientes.numero_documento',
            'clientes.telefono',
            'clientes.email',
        );

        $search = $request->input('busqueda');
        if ($search) {
            $query->having('clientes.nombre', 'like', "%{$search}%")
                ->orHaving('clientes.nombre', 'like', "%{$search}%")
                ->orHaving('clientes.numero_documento', 'like', "%{$search}%");
        }

        $orden = $request->input('orden', 'total_compras');
        $direccion = $request->input('direccion', 'desc');
        $query->orderBy($orden, $direccion);

        $perPage = (int) ($request->input('por_pagina', 50));
        $page = (int) ($request->input('page', 1));

        $total = $query->get()->count();
        $items = $query->skip(($page - 1) * $perPage)->take($perPage)->get();

        $items = $items->map(function ($item) {
            return [
                'id' => $item->id,
                'nombre_completo' => $item->nombre,
                'tipo_documento' => $item->tipo_documento,
                'numero_documento' => $item->numero_documento,
                'telefono' => $item->telefono,
                'email' => $item->email,
                'total_compras' => (int) $item->total_compras,
                'monto_total' => round((float) $item->monto_total, 2),
                'promedio_compra' => round((float) $item->promedio_compra, 2),
                'ultima_compra' => $item->ultima_compra,
            ];
        });

        $resumen = [
            'total_clientes' => $items->count() > 0
                ? $query->get()->count()
                : Cliente::whereHas('ventas', fn ($q) => $q->where('estado', 'completado'))->count(),
            'total_ingresos' => round((float) $items->sum('monto_total'), 2),
            'promedio_general' => $total > 0 ? round((float) $items->sum('monto_total') / $total, 2) : 0,
        ];

        $paginator = new LengthAwarePaginator(
            $items,
            $total,
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()],
        );

        return [
            'data' => $paginator,
            'resumen' => $resumen,
        ];
    }
}
