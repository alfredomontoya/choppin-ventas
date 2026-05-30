<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Exports\OrdenCompraExport;
use App\Http\Requests\StoreOrdenCompraRequest;
use App\Http\Requests\UpdateOrdenCompraRequest;
use App\Models\Producto;
use App\Models\Proveedor;
use App\Services\OrdenCompraService;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class OrdenCompraController extends Controller
{
    public function __construct(
        protected OrdenCompraService $service,
    ) {}

    public function index(Request $request)
    {
        return inertia('Compras/Index', [
            'ordenes' => $this->service->listar($request),
            'filtros' => $request->only(['busqueda', 'orden', 'direccion', 'por_pagina']),
        ]);
    }

    public function create(Request $request)
    {
        return inertia('Compras/Create', [
            'return_url' => $request->query('return_url') ?: url()->previous(),
            'proveedores' => Proveedor::orderBy('nombre')->get(['id', 'nombre', 'contacto', 'nit_ci']),
            'productos' => Producto::with(['categoria', 'imagenes'])->where('activo', true)->orderBy('nombre')->get(),
        ]);
    }

    public function store(StoreOrdenCompraRequest $request)
    {
        $data = $request->validated();
        $orden = $this->service->crearOrden(
            proveedorId: $data['proveedor_id'],
            tipoComprobante: $data['tipo_comprobante'],
            detalles: $data['detalles'],
            observaciones: $data['observaciones'] ?? null,
        );

        return redirect()->route('compras.show', [
            'compra' => $orden,
            'url_anterior' => $request->input('return_url') ?: route('compras.index'),
        ])->with('success', 'Orden de compra creada correctamente.');
    }

    public function show(int $id, Request $request)
    {
        return inertia('Compras/Show', [
            'orden' => $this->service->obtenerPorId($id),
            'url_anterior' => $request->query('url_anterior') ?: url()->previous() ?: route('compras.index'),
        ]);
    }

    public function edit(int $id, Request $request)
    {
        $orden = $this->service->obtenerPorId($id);

        return inertia('Compras/Edit', [
            'orden' => $orden,
            'return_url' => $request->query('return_url') ?: url()->previous(),
            'proveedores' => Proveedor::orderBy('nombre')->get(['id', 'nombre', 'contacto', 'nit_ci']),
            'productos' => Producto::with(['categoria', 'imagenes'])->where('activo', true)->orderBy('nombre')->get(),
        ]);
    }

    public function update(UpdateOrdenCompraRequest $request, int $id)
    {
        $this->service->actualizar($id, $request->validated());

        return redirect()->route('compras.show', [
            'compra' => $id,
            'url_anterior' => $request->input('return_url') ?: route('compras.index'),
        ])->with('success', 'Orden de compra actualizada correctamente.');
    }

    public function destroy(int $id)
    {
        $this->service->eliminar($id);

        return redirect()->route('compras.index')
            ->with('success', 'Orden de compra anulada correctamente.');
    }

    public function exportar(Request $request)
    {
        return Excel::download(
            new OrdenCompraExport($request),
            'ordenes-compra.xlsx'
        );
    }

    public function recibir(int $id)
    {
        $orden = $this->service->obtenerPorId($id);
        $this->service->recibirOrden($orden);

        return redirect()->route('compras.show', [
            'compra' => $id,
        ])->with('success', 'Orden de compra recibida correctamente. Stock actualizado.');
    }
}
