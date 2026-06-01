<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Exports\VentaExport;
use App\Http\Requests\StoreVentaRequest;
use App\Http\Requests\UpdateVentaRequest;
use App\Models\Cliente;
use App\Models\Producto;
use App\Models\Venta;
use App\Services\VentaService;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class VentaController extends Controller
{
    public function __construct(
        protected VentaService $service,
    ) {}

    public function index(Request $request)
    {
        return inertia('Ventas/Index', [
            'ventas' => $this->service->listar($request),
            'filtros' => $request->only(['busqueda', 'orden', 'direccion', 'por_pagina']),
        ]);
    }

    public function create(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        return inertia('Ventas/Create', [
            'return_url' => $request->query('return_url') ?: url()->previous(),
            'clientes' => Cliente::orderBy('nombre')->get(['id', 'nombre', 'apellido', 'tipo_documento', 'numero_documento']),
            'productos' => Producto::with(['categoria', 'precios', 'imagenes'])->where('activo', true)->orderBy('nombre')->get(),
            'productosFavoritos' => $user->productosFavoritos,
        ]);
    }

    public function store(StoreVentaRequest $request)
    {
        $data = $request->validated();
        $venta = $this->service->registrarVenta(
            detalles: $data['detalles'],
            tipoComprobante: $data['tipo_comprobante'],
            tipoPago: $data['tipo_pago'],
            clienteId: $data['cliente_id'] ?? null,
            descuento: (float) ($data['descuento'] ?? 0),
            montoRecibido: isset($data['monto_recibido']) ? (float) $data['monto_recibido'] : null,
            cambio: isset($data['cambio']) ? (float) $data['cambio'] : null,
            observaciones: $data['observaciones'] ?? null,
        );

        return redirect()->route('ventas.show', [
            'venta' => $venta,
            'url_anterior' => $request->input('return_url') ?: route('ventas.index'),
        ])->with('success', 'Venta creada correctamente.');
    }

    public function show(int $id, Request $request)
    {
        return inertia('Ventas/Show', [
            'venta' => $this->service->obtenerPorId($id),
            'url_anterior' => $request->query('url_anterior') ?: url()->previous() ?: route('ventas.index'),
        ]);
    }

    public function update(UpdateVentaRequest $request, int $id)
    {
        $this->service->actualizar($id, $request->validated());

        return redirect()->route('ventas.show', [
            'venta' => $id,
            'url_anterior' => $request->input('return_url') ?: route('ventas.index'),
        ])->with('success', 'Venta actualizada correctamente.');
    }

    public function edit(int $id, Request $request)
    {
        return inertia('Ventas/Edit', [
            'venta' => $this->service->obtenerPorId($id),
            'return_url' => $request->query('return_url') ?: url()->previous(),
            'clientes' => Cliente::orderBy('nombre')->get(['id', 'nombre', 'apellido', 'tipo_documento', 'numero_documento']),
        ]);
    }

    public function destroy(int $id)
    {
        $this->service->anular($id);

        return redirect()->route('ventas.index')
            ->with('success', 'Venta anulada correctamente.');
    }

    public function exportar(Request $request)
    {
        return Excel::download(
            new VentaExport($request),
            'ventas.xlsx'
        );
    }

    public function imprimir(int $id, Request $request)
    {
        $venta = $this->service->obtenerPorId($id);
        $tipo = $request->query('tipo', $venta->tipo_comprobante === 'factura' ? 'factura' : 'nota');

        return view('ventas.print', compact('venta', 'tipo'));
    }
}
