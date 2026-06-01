<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Exports\AlmacenExport;
use App\Http\Requests\StoreAlmacenRequest;
use App\Models\Producto;
use App\Services\AlmacenService;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class AlmacenController extends Controller
{
    public function __construct(
        protected AlmacenService $service,
    ) {}

    public function index(Request $request)
    {
        $filtros = $request->only(['busqueda', 'tipo', 'fecha_desde', 'fecha_hasta', 'orden', 'direccion', 'por_pagina']);

        return inertia('Almacen/Index', [
            'movimientos' => $this->service->listar($request),
            'filtros' => $filtros,
        ]);
    }

    public function create(Request $request)
    {
        return inertia('Almacen/Create', [
            'return_url' => $request->query('return_url') ?: url()->previous(),
            'productos' => Producto::where('activo', true)->orderBy('nombre')->get(['id', 'nombre', 'codigo']),
        ]);
    }

    public function store(StoreAlmacenRequest $request)
    {
        $data = $request->validated();
        $movimiento = $this->service->crear($data);

        return redirect()->route('almacen.show', [
            'almacen' => $movimiento,
            'url_anterior' => $request->input('return_url') ?: route('almacen.index'),
        ])->with('success', 'Movimiento registrado correctamente.');
    }

    public function show(int $id, Request $request)
    {
        return inertia('Almacen/Show', [
            'movimiento' => $this->service->obtenerPorId($id),
            'url_anterior' => $request->query('url_anterior') ?: url()->previous() ?: route('almacen.index'),
        ]);
    }

    public function exportar(Request $request)
    {
        return Excel::download(
            new AlmacenExport($request),
            'almacen-movimientos.xlsx'
        );
    }
}
