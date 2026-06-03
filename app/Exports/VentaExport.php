<?php

declare(strict_types=1);

namespace App\Exports;

use App\Models\Venta;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class VentaExport implements FromQuery, WithHeadings, WithMapping
{
    public function __construct(
        protected Request $request
    ) {}

    public function query()
    {
        return Venta::with('cliente', 'user')
            ->applyFilters($this->request)
            ->applySorting($this->request);
    }

    public function headings(): array
    {
        return [
            'N° Comprobante',
            'Tipo',
            'Fecha',
            'Cliente',
            'Documento Cliente',
            'Subtotal',
            'Descuento',
            'Total',
            'Tipo Pago',
            'Estado',
            'Usuario',
            'Observaciones',
        ];
    }

    public function map($venta): array
    {
        return [
            $venta->numero_comprobante,
            ucfirst($venta->tipo_comprobante),
            $venta->fecha_emision->format('d/m/Y H:i'),
            $venta->cliente ? $venta->cliente->nombre : '—',
            $venta->cliente?->numero_documento ?? '—',
            number_format((float) $venta->subtotal, 2),
            number_format((float) $venta->descuento, 2),
            number_format((float) $venta->total, 2),
            ucfirst($venta->tipo_pago),
            ucfirst($venta->estado),
            $venta->user?->name ?? '—',
            $venta->observaciones ?? '—',
        ];
    }
}
