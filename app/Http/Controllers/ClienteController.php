<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Exports\ClienteExport;
use App\Http\Requests\StoreClienteRequest;
use App\Http\Requests\UpdateClienteRequest;
use App\Services\ClienteService;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class ClienteController extends Controller
{
    public function __construct(
        protected ClienteService $service,
    ) {}

    public function index(Request $request)
    {
        return inertia('Clientes/Index', [
            'clientes' => $this->service->listar($request),
            'filtros' => $request->only(['busqueda', 'orden', 'direccion', 'por_pagina']),
        ]);
    }

    public function create(): \Inertia\Response
    {
        return inertia('Clientes/Create');
    }

    public function store(StoreClienteRequest $request)
    {
        $cliente = $this->service->crear($request->validated());

        return redirect()->route('clientes.show', $cliente->id)
            ->with('success', 'Cliente creado correctamente.');
    }

    public function show(int $id): \Inertia\Response
    {
        return inertia('Clientes/Show', [
            'cliente' => $this->service->obtenerPorId($id),
        ]);
    }

    public function update(UpdateClienteRequest $request, int $id)
    {
        $this->service->actualizar($id, $request->validated());

        return redirect()->route('clientes.show', $id)
            ->with('success', 'Cliente actualizado correctamente.');
    }

    public function edit(int $id): \Inertia\Response
    {
        return inertia('Clientes/Edit', [
            'cliente' => $this->service->obtenerPorId($id),
        ]);
    }

    public function destroy(int $id)
    {
        $this->service->eliminar($id);

        return redirect()->route('clientes.index')
            ->with('success', 'Cliente eliminado correctamente.');
    }

    public function exportar(Request $request)
    {
        return Excel::download(
            new ClienteExport($request),
            'clientes.xlsx'
        );
    }
}
