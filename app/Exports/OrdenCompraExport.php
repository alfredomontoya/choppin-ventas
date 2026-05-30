<?php

declare(strict_types=1);

namespace App\Exports;

use App\Models\OrdenCompra;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class OrdenCompraExport implements FromQuery, WithHeadings, WithMapping
{
    public function __construct(
        protected Request $request
    ) {}

    public function query()
    {
        return OrdenCompra::with('proveedor', 'user')->applyFilters($this->request);
    }

    public function headings(): array
    {
        return [
            'N° Comprobante',
            'Proveedor',
            'NIT/CI',
            'Tipo',
            'Fecha',
            'Subtotal',
            'IGV',
            'Total',
            'Estado',
            'Usuario',
            'Observaciones',
        ];
    }

    public function map($orden): array
    {
        return [
            $orden->numero_comprobante,
            $orden->proveedor?->nombre ?? '—',
            $orden->proveedor?->nit_ci ?? '—',
            ucfirst($orden->tipo_comprobante),
            $orden->fecha_emision->format('d/m/Y H:i'),
            number_format((float) $orden->subtotal, 2),
            number_format((float) $orden->igv, 2),
            number_format((float) $orden->total, 2),
            ucfirst($orden->estado),
            $orden->user?->name ?? '—',
            $orden->observaciones ?? '—',
        ];
    }
}
