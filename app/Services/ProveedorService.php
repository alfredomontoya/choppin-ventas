<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Proveedor;
use Illuminate\Http\Request;

class ProveedorService
{
    public function listar(Request $request)
    {
        return Proveedor::query()
            ->applyFilters($request)
            ->applySorting($request)
            ->paginate($request->input('por_pagina', 10))
            ->withQueryString();
    }

    public function obtenerPorId(int $id): Proveedor
    {
        return Proveedor::findOrFail($id);
    }

    public function crear(array $data): Proveedor
    {
        return Proveedor::create($data);
    }

    public function actualizar(int $id, array $data): Proveedor
    {
        $proveedor = $this->obtenerPorId($id);
        $proveedor->update($data);

        return $proveedor;
    }

    public function eliminar(int $id): void
    {
        $proveedor = $this->obtenerPorId($id);
        $proveedor->delete();
    }

    public function queryParaExportar(Request $request)
    {
        return Proveedor::query()->applyFilters($request);
    }
}
