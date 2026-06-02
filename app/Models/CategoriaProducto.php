<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\HasCreadorActualizador;
use App\Traits\HasEliminador;
use App\Traits\HasFiltros;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CategoriaProducto extends Model
{
    protected $table = 'categoria_productos';

    use HasCreadorActualizador, HasEliminador, HasFactory, HasFiltros, SoftDeletes;

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
