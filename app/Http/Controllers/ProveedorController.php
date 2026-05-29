<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Exports\ProveedorExport;
use App\Http\Requests\StoreProveedorRequest;
use App\Http\Requests\UpdateProveedorRequest;
use App\Services\ProveedorService;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class ProveedorController extends Controller
{
    public function __construct(
        protected ProveedorService $service,
    ) {}

    public function index(Request $request)
    {
        return inertia('Proveedores/Index', [
            'proveedores' => $this->service->listar($request),
            'filtros' => $request->only(['busqueda', 'orden', 'direccion', 'por_pagina']),
        ]);
    }

    public function create(Request $request)
    {
        return inertia('Proveedores/Create', [
            'return_url' => $request->query('return_url') ?: url()->previous(),
        ]);
    }

    public function store(StoreProveedorRequest $request)
    {
        $proveedor = $this->service->crear($request->validated());

        return redirect()->route('proveedores.show', [
            'proveedore' => $proveedor,
            'url_anterior' => $request->input('return_url') ?: route('proveedores.index'),
        ])->with('success', 'Proveedor creado correctamente.');
    }

    public function show(int $id, Request $request)
    {
        return inertia('Proveedores/Show', [
            'proveedor' => $this->service->obtenerPorId($id),
            'url_anterior' => $request->query('url_anterior') ?: url()->previous() ?: route('proveedores.index'),
        ]);
    }

    public function update(UpdateProveedorRequest $request, int $id)
    {
        $this->service->actualizar($id, $request->validated());

        return redirect()->route('proveedores.show', [
            'proveedore' => $id,
            'url_anterior' => $request->input('return_url') ?: route('proveedores.index'),
        ])->with('success', 'Proveedor actualizado correctamente.');
    }

    public function edit(int $id, Request $request)
    {
        return inertia('Proveedores/Edit', [
            'proveedor' => $this->service->obtenerPorId($id),
            'return_url' => $request->query('return_url') ?: url()->previous(),
        ]);
    }

    public function destroy(int $id)
    {
        $this->service->eliminar($id);

        return redirect()->route('proveedores.index')
            ->with('success', 'Proveedor eliminado correctamente.');
    }

    public function exportar(Request $request)
    {
        return Excel::download(
            new ProveedorExport($request),
            'proveedores.xlsx'
        );
    }
}
