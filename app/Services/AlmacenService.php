<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\TipoMovimientoStock;
use App\Models\MovimientoStock;
use App\Models\Producto;
use Illuminate\Http\Request;

class AlmacenService
{
    public function listar(Request $request)
    {
        return MovimientoStock::query()
            ->with('producto', 'user')
            ->when($request->filled('busqueda'), fn ($q) => $q->whereHas('producto', fn ($q) => $q->where('nombre', 'like', "%{$request->busqueda}%")->orWhere('codigo', 'like', "%{$request->busqueda}%")))
            ->when($request->filled('tipo'), fn ($q) => $q->where('tipo', $request->tipo))
            ->when($request->filled('fecha_desde'), fn ($q) => $q->whereDate('created_at', '>=', $request->fecha_desde))
            ->when($request->filled('fecha_hasta'), fn ($q) => $q->whereDate('created_at', '<=', $request->fecha_hasta))
            ->applySorting($request)
            ->paginate($request->input('por_pagina', 10))
            ->withQueryString();
    }

    public function obtenerPorId(int $id): MovimientoStock
    {
        return MovimientoStock::with(['producto', 'user', 'referencia'])->findOrFail($id);
    }

    public function crear(array $data): MovimientoStock
    {
        $producto = Producto::findOrFail($data['producto_id']);
        $tipo = TipoMovimientoStock::from($data['tipo']);

        return app(StockService::class)->registrarMovimiento(
            producto: $producto,
            tipo: $tipo,
            cantidad: (float) $data['cantidad'],
            motivo: $data['motivo'],
        );
    }

    public function queryParaExportar(Request $request)
    {
        return MovimientoStock::query()
            ->with('producto')
            ->when($request->filled('busqueda'), fn ($q) => $q->whereHas('producto', fn ($q) => $q->where('nombre', 'like', "%{$request->busqueda}%")->orWhere('codigo', 'like', "%{$request->busqueda}%")))
            ->when($request->filled('tipo'), fn ($q) => $q->where('tipo', $request->tipo))
            ->when($request->filled('fecha_desde'), fn ($q) => $q->whereDate('created_at', '>=', $request->fecha_desde))
            ->when($request->filled('fecha_hasta'), fn ($q) => $q->whereDate('created_at', '<=', $request->fecha_hasta));
    }
}
