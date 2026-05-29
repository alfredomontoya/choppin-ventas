<?php

declare(strict_types=1);

namespace App\Exports;

use App\Models\Proveedor;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ProveedorExport implements FromQuery, WithHeadings, WithMapping
{
    public function __construct(
        protected Request $request
    ) {}

    public function query()
    {
        return Proveedor::query()->applyFilters($this->request);
    }

    public function headings(): array
    {
        return [
            'ID',
            'Nombre',
            'Contacto',
            'Teléfono',
            'Email',
            'Dirección',
            'NIT/CI',
        ];
    }

    public function map($proveedor): array
    {
        return [
            $proveedor->id,
            $proveedor->nombre,
            $proveedor->contacto ?? '—',
            $proveedor->telefono ?? '—',
            $proveedor->email ?? '—',
            $proveedor->direccion ?? '—',
            $proveedor->nit_ci ?? '—',
        ];
    }
}
