<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Exports\VentaExport;
use App\Http\Requests\StoreVentaRequest;
use App\Http\Requests\UpdateVentaRequest;
use App\Models\Cliente;
use App\Models\Producto;
use App\Models\User;
use App\Services\VentaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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

    public function create(): \Inertia\Response
    {
        /** @var User $user */
        $user = auth()->user();

        $qrPath = config('ventas.qr.image_path');

        return inertia('Ventas/Create', [
            'clientes' => Cliente::orderBy('nombre')->get(['id', 'nombre', 'tipo_documento', 'numero_documento']),
            'productos' => Producto::with(['categoria', 'imagenes', 'precios'])
                ->where('activo', true)
                ->orderBy('nombre')
                ->limit(200)
                ->get()
                ->map(function (Producto $producto) {
                    $firstImage = $producto->imagenes->first();
                    $producto->imagen = $firstImage ? Storage::url($firstImage->ruta) : null;
                    return $producto;
                }),
            'productosFavoritos' => $user->productosFavoritos->load('imagenes')->map(function (Producto $producto) {
                $firstImage = $producto->imagenes->first();
                $producto->imagen = $firstImage ? Storage::url($firstImage->ruta) : null;
                return $producto;
            }),
            'qrImage' => $qrPath,
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

        return redirect()->route('ventas.show', $venta->id)
            ->with('success', 'Venta creada correctamente.');
    }

    public function show(int $id): \Inertia\Response
    {
        return inertia('Ventas/Show', [
            'venta' => $this->service->obtenerPorId($id),
        ]);
    }

    public function update(UpdateVentaRequest $request, int $id)
    {
        $this->service->actualizar($id, $request->validated());

        return redirect()->route('ventas.show', $id)
            ->with('success', 'Venta actualizada correctamente.');
    }

    public function edit(int $id): \Inertia\Response
    {
        return inertia('Ventas/Edit', [
            'venta' => $this->service->obtenerPorId($id),
            'clientes' => Cliente::orderBy('nombre')->get(['id', 'nombre', 'tipo_documento', 'numero_documento']),
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
