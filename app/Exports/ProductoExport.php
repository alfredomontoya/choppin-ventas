<?php

declare(strict_types=1);

namespace App\Exports;

use App\Services\ProductoService;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ProductoExport implements FromQuery, WithHeadings, WithMapping
{
    public function __construct(
        protected Request $request,
    ) {}

    public function query()
    {
        return app(ProductoService::class)->queryParaExportar($this->request);
    }

    public function headings(): array
    {
        return [
            'Código',
            'Nombre',
            'Categoría',
            'Stock Actual',
            'Stock Mínimo',
            'Unidad Medida',
            'Activo',
        ];
    }

    public function map($producto): array
    {
        return [
            $producto->codigo,
            $producto->nombre,
            $producto->categoria?->nombre ?? '',
            $producto->stock_actual,
            $producto->stock_minimo,
            $producto->unidad_medida,
            $producto->activo ? 'Sí' : 'No',
        ];
    }
}
