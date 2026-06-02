<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Exports\CategoriaProductoExport;
use App\Http\Requests\StoreCategoriaProductoRequest;
use App\Http\Requests\UpdateCategoriaProductoRequest;
use App\Models\CategoriaProducto;
use App\Services\CategoriaProductoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;

class CategoriaProductoController extends Controller
{
    public function __construct(
        protected CategoriaProductoService $service,
    ) {}

    public function index(Request $request)
    {
        $categoria_productos = $this->service->listar($request);
        $categoria_productos->through(fn ($c) => $this->imagenAUrl($c));

        return inertia('CategoriaProductos/Index', [
            'categoria_productos' => $categoria_productos,
            'filtros' => $request->only(['busqueda', 'orden', 'direccion', 'por_pagina']),
        ]);
    }

    public function create(Request $request)
    {
        return inertia('CategoriaProductos/Create', [
            'return_url' => $request->query('return_url') ?: url()->previous(),
        ]);
    }

    public function store(StoreCategoriaProductoRequest $request)
    {
        $categoria = $this->service->crear($request->validated());

        return redirect()->route('categoria_productos.show', [
            'categoria_producto' => $categoria,
            'url_anterior' => $request->input('return_url') ?: route('categoria_productos.index'),
        ])->with('success', 'Categoría creada correctamente.');
    }

    public function show(int $id, Request $request)
    {
        return inertia('CategoriaProductos/Show', [
            'categoria_producto' => $this->imagenAUrl($this->service->obtenerPorId($id)),
            'url_anterior' => $request->query('url_anterior') ?: url()->previous() ?: route('categoria_productos.index'),
        ]);
    }

    public function update(UpdateCategoriaProductoRequest $request, int $id)
    {
        $categoria = $this->service->actualizar($id, $request->validated());

        return redirect()->route('categoria_productos.show', [
            'categoria_producto' => $id,
            'url_anterior' => $request->input('return_url') ?: route('categoria_productos.index'),
        ])->with('success', 'Categoría actualizada correctamente.');
    }

    public function edit(int $id, Request $request)
    {
        return inertia('CategoriaProductos/Edit', [
            'categoria_producto' => $this->imagenAUrl($this->service->obtenerPorId($id)),
            'return_url' => $request->query('return_url') ?: url()->previous(),
        ]);
    }

    public function destroy(int $id)
    {
        $this->service->eliminar($id);

        return redirect()->route('categoria_productos.index')
            ->with('success', 'Categoría eliminada correctamente.');
    }

    public function exportar(Request $request)
    {
        return Excel::download(
            new CategoriaProductoExport($request),
            'categoria_productos.xlsx'
        );
    }

    private function imagenAUrl(CategoriaProducto $categoria): CategoriaProducto
    {
        if ($categoria->imagen && ! str_starts_with($categoria->imagen, 'http')) {
            $categoria->imagen = Storage::url($categoria->imagen);
        }

        return $categoria;
    }
}
