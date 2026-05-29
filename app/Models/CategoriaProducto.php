<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\HasCreadorActualizador;
use App\Traits\HasEliminador;
use App\Traits\HasFiltros;

class CategoriaProducto extends Model
{
    protected $table = 'categoria_productos';

    use HasFactory, SoftDeletes, HasCreadorActualizador, HasEliminador, HasFiltros;

    protected $fillable = [
        'nombre',
        'descripcion',
        'imagen',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'activo' => 'boolean',
        ];
    }

    public function productos(): HasMany
    {
        return $this->hasMany(Producto::class, 'categoria_id');
    }

    public function getSearchColumns(): array
    {
        return ['nombre', 'descripcion'];
    }
}
