<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Cliente;
use Illuminate\Http\Request;

class ClienteService
{
    public function listar(Request $request)
    {
        return Cliente::query()
            ->applyFilters($request)
            ->applySorting($request)
            ->paginate($request->input('por_pagina', 10))
            ->withQueryString();
    }

    public function obtenerPorId(int $id): Cliente
    {
        return Cliente::findOrFail($id);
    }

    public function crear(array $data): Cliente
    {
        return Cliente::create($data);
    }

    public function actualizar(int $id, array $data): Cliente
    {
        $cliente = $this->obtenerPorId($id);
        $cliente->update($data);
        return $cliente;
    }

    public function eliminar(int $id): void
    {
        $cliente = $this->obtenerPorId($id);
        $cliente->delete();
    }

    public function queryParaExportar(Request $request)
    {
        return Cliente::query()->applyFilters($request);
    }
}
