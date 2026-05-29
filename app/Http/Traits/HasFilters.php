<?php

declare(strict_types=1);

namespace App\Http\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

trait HasFilters
{
    public function scopeApplyFilters(Builder $query, Request $request): Builder
    {
        $busqueda = $request->input('busqueda', []);

        foreach ($busqueda as $campo => $valor) {
            if ($valor !== null && $valor !== '') {
                $query->where($campo, 'like', "%{$valor}%");
            }
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
