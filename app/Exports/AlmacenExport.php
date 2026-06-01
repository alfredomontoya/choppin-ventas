<?php

declare(strict_types=1);

namespace App\Exports;

use App\Services\AlmacenService;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class AlmacenExport implements FromQuery, WithHeadings, WithMapping
{
    public function __construct(
        protected Request $request,
    ) {}

    public function query()
    {
        return app(AlmacenService::class)->queryParaExportar($this->request);
    }

    public function headings(): array
    {
        return [
            'ID',
            'Producto',
            'Código',
            'Tipo',
            'Cantidad',
            'Stock Anterior',
            'Stock Posterior',
            'Usuario',
            'Motivo',
            'Fecha',
        ];
    }

    public function map($movimiento): array
    {
        return [
            $movimiento->id,
            $movimiento->producto?->nombre ?? '—',
            $movimiento->producto?->codigo ?? '—',
            match ($movimiento->tipo) {
                'ingreso_compra' => 'Ingreso por Compra',
                'ingreso_manual' => 'Ingreso Manual',
                'ingreso_anulacion' => 'Ingreso por Anulación',
                'egreso_venta' => 'Egreso por Venta',
                'egreso_manual' => 'Egreso Manual',
                'ajuste' => 'Ajuste',
                default => $movimiento->tipo,
            },
            $movimiento->cantidad,
            $movimiento->stock_anterior,
            $movimiento->stock_posterior,
            $movimiento->user?->name ?? '—',
            $movimiento->motivo ?? '—',
            $movimiento->created_at?->format('d/m/Y H:i') ?? '—',
        ];
    }
}
