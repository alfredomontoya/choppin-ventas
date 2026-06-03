<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Exports\ProductoExport;
use App\Http\Requests\StoreProductoRequest;
use App\Http\Requests\UpdateProductoRequest;
use App\Models\CategoriaProducto;
use App\Models\Producto;
use App\Services\ProductoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;

class ProductoController extends Controller
{
    public function __construct(
        protected ProductoService $service,
    ) {}

    public function index(Request $request)
    {
        $productos = $this->service->listar($request);
        $productos->through(fn ($p) => $this->rutasAUrl($p));

        $favoritosIds = auth()->user()->productosFavoritos()->pluck('producto_id');

        return inertia('Productos/Index', [
            'productos' => $productos,
            'filtros' => $request->only(['busqueda', 'orden', 'direccion', 'por_pagina', 'stock_bajo', 'con_stock', 'sin_stock', 'stock_desde', 'stock_hasta']),
            'productosFavoritos' => $favoritosIds,
        ]);
    }

    public function create(): \Inertia\Response
    {
        return inertia('Productos/Create', [
            'categorias' => CategoriaProducto::where('activo', true)->orderBy('nombre')->get(),
        ]);
    }

    public function store(StoreProductoRequest $request)
    {
        $data = $request->validated();
        $producto = $this->service->crear($data);

        return redirect()->route('productos.show', $producto->id)
            ->with('success', 'Producto creado correctamente.');
    }

    public function show(int $id, Request $request): \Inertia\Response
    {
        return inertia('Productos/Show', [
            'producto' => $this->rutasAUrl($this->service->obtenerPorId($id)),
            'esAdmin' => $request->user()?->hasRole('Administrador') ?? false,
        ]);
    }

    public function update(UpdateProductoRequest $request, int $id)
    {
        $this->service->actualizar($id, $request->validated());

        return redirect()->route('productos.show', $id)
            ->with('success', 'Producto actualizado correctamente.');
    }

    public function edit(int $id): \Inertia\Response
    {
        return inertia('Productos/Edit', [
            'producto' => $this->rutasAUrl($this->service->obtenerPorId($id)),
            'categorias' => CategoriaProducto::where('activo', true)->orderBy('nombre')->get(),
        ]);
    }

    private function rutasAUrl(Producto $producto): Producto
    {
        foreach ($producto->imagenes ?? [] as $img) {
            if ($img->ruta && ! str_starts_with($img->ruta, 'http')) {
                $img->ruta = Storage::url($img->ruta);
            }
        }

        return $producto;
    }

    public function destroy(int $id)
    {
        $this->service->eliminar($id);

        return redirect()->route('productos.index')
            ->with('success', 'Producto eliminado correctamente.');
    }

    public function toggleFavorito(Producto $producto): JsonResponse
    {
        $user = auth()->user();
        $esFavorito = $user->productosFavoritos()->toggle($producto->id);

        return response()->json([
            'favorito' => count($esFavorito['attached']) > 0,
        ]);
    }

    public function exportar(Request $request)
    {
        return Excel::download(
            new ProductoExport($request),
            'productos.xlsx'
        );
    }
}
