<?php

declare(strict_types=1);

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

trait HasFiltros
{
    public function scopeApplyFilters(Builder $query, Request $request): Builder
    {
        $busqueda = $request->input('busqueda');

        if ($busqueda) {
            $columnas = method_exists($this, 'getSearchColumns')
                ? $this->getSearchColumns()
                : ['nombre'];

            $query->where(function (Builder $q) use ($busqueda, $columnas) {
                foreach ($columnas as $columna) {
                    $q->orWhere($columna, 'like', "%{$busqueda}%");
                }
            });
        }

        return $query;
    }

    public function scopeApplySorting(Builder $query, Request $request): Builder
    {
        $orden = $request->input('orden');
        $direccion = $request->input('direccion', 'asc');

        if ($orden && in_array($direccion, ['asc', 'desc'])) {
            $query->orderBy($orden, $direccion);
        } else {
            $query->latest();
        }

        return $query;
    }
}