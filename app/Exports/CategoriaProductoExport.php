<?php

declare(strict_types=1);

namespace App\Exports;

use App\Models\CategoriaProducto;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class CategoriaProductoExport implements FromQuery, WithHeadings, WithMapping
{
    public function __construct(
        protected Request $request
    ) {}

    public function query()
    {
        return CategoriaProducto::query()->applyFilters($this->request);
    }

    public function headings(): array
    {
        return [
            'ID',
            'Nombre',
            'Descripción',
            'Imagen',
            'Activo',
        ];
    }

    public function map($categoria): array
    {
        return [
            $categoria->id,
            $categoria->nombre,
            $categoria->descripcion ?? '—',
            $categoria->imagen ?? '—',
            $categoria->activo ? 'Sí' : 'No',
        ];
    }
}
