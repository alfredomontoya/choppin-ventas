<?php

declare(strict_types=1);

namespace App\Exports;

use App\Models\Cliente;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ClienteExport implements FromQuery, WithHeadings, WithMapping
{
    public function __construct(
        protected Request $request
    ) {}

    public function query()
    {
        return Cliente::query()->applyFilters($this->request);
    }

    public function headings(): array
    {
        return [
            'ID',
            'Nombre',
            'Tipo Documento',
            'Número Documento',
            'Teléfono',
            'Email',
            'Dirección',
        ];
    }

    public function map($cliente): array
    {
        return [
            $cliente->id,
            $cliente->nombre,
            strtoupper($cliente->tipo_documento),
            $cliente->numero_documento,
            $cliente->telefono ?? '—',
            $cliente->email ?? '—',
            $cliente->direccion ?? '—',
        ];
    }
}
