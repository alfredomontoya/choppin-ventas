<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Exports\OrdenCompraExport;
use App\Http\Requests\StoreOrdenCompraRequest;
use App\Http\Requests\UpdateOrdenCompraRequest;
use App\Models\Producto;
use App\Models\Proveedor;
use App\Services\OrdenCompraService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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

    public function create(): \Inertia\Response
    {
        $productos = Producto::with(['categoria', 'imagenes', 'precios'])
            ->where('activo', true)
            ->orderBy('nombre')
            ->get()
            ->map(fn (Producto $p) => [
                ...$p->toArray(),
                'imagen' => $p->imagenes->first()?->ruta ? Storage::url($p->imagenes->first()->ruta) : null,
                'precio_venta' => $p->precio_venta,
                'margen_utilidad' => (float) ($p->margen_utilidad ?? 30),
            ]);

        return inertia('Compras/Create', [
            'proveedores' => Proveedor::orderBy('nombre')->get(['id', 'nombre', 'contacto', 'nit_ci']),
            'productos' => $productos,
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

        return redirect()->route('compras.show', $orden->id)
            ->with('success', 'Orden de compra creada correctamente.');
    }

    public function show(int $id): \Inertia\Response
    {
        return inertia('Compras/Show', [
            'orden' => $this->service->obtenerPorId($id),
        ]);
    }

    public function edit(int $id): \Inertia\Response
    {
        $orden = $this->service->obtenerPorId($id);

        $productos = Producto::with(['categoria', 'imagenes', 'precios'])
            ->where('activo', true)
            ->orderBy('nombre')
            ->get()
            ->map(fn (Producto $p) => [
                ...$p->toArray(),
                'imagen' => $p->imagenes->first()?->ruta ? Storage::url($p->imagenes->first()->ruta) : null,
                'precio_venta' => $p->precio_venta,
                'margen_utilidad' => (float) ($p->margen_utilidad ?? 30),
            ]);

        return inertia('Compras/Edit', [
            'orden' => $orden,
            'proveedores' => Proveedor::orderBy('nombre')->get(['id', 'nombre', 'contacto', 'nit_ci']),
            'productos' => $productos,
        ]);
    }

    public function update(UpdateOrdenCompraRequest $request, int $id)
    {
        $this->service->actualizar($id, $request->validated());

        return redirect()->route('compras.show', $id)
            ->with('success', 'Orden de compra actualizada correctamente.');
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

    public function verificarPrecios(int $id): JsonResponse
    {
        $orden = $this->service->obtenerPorId($id);
        $discrepancias = $this->service->obtenerDiscrepanciasPrecios($orden);

        return response()->json(['discrepancias' => $discrepancias]);
    }

    public function recibir(int $id, Request $request)
    {
        $orden = $this->service->obtenerPorId($id);
        $actualizarPrecios = $request->input('actualizar_precios');

        $this->service->recibirOrden($orden, $actualizarPrecios);

        $mensaje = $actualizarPrecios
            ? 'Orden recibida. Stock y precios actualizados.'
            : 'Orden de compra recibida correctamente. Stock actualizado.';

        return redirect()->route('compras.show', [
            'compra' => $id,
        ])->with('success', $mensaje);
    }
}
