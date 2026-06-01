<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\HasCreadorActualizador;
use App\Traits\HasEliminador;
use App\Traits\HasFiltros;

class Producto extends Model
{
    protected $table = 'productos';

    use HasFactory, SoftDeletes, HasCreadorActualizador, HasEliminador, HasFiltros;

    protected $fillable = [
        'categoria_id',
        'codigo',
        'nombre',
        'descripcion',
        'imagen',
        'stock_actual',
        'stock_minimo',
        'unidad_medida',
        'margen_utilidad',
        'activo',
    ];

    protected $with = ['imagenes'];

    protected function casts(): array
    {
        return [
            'stock_actual' => 'decimal:2',
            'stock_minimo' => 'decimal:2',
            'margen_utilidad' => 'decimal:2',
            'activo' => 'boolean',
        ];
    }

    public function getSearchColumns(): array
    {
        return ['nombre', 'codigo', 'descripcion'];
    }

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(CategoriaProducto::class, 'categoria_id');
    }

    public function precios(): HasMany
    {
        return $this->hasMany(PrecioProducto::class);
    }

    public function imagenes(): HasMany
    {
        return $this->hasMany(ProductoImagen::class)->orderBy('orden');
    }

    public function movimientosStock(): HasMany
    {
        return $this->hasMany(MovimientoStock::class);
    }

    public function favoritos(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'producto_user_favoritos')
            ->withTimestamps();
    }

    public function getPrecioVentaAttribute(): float
    {
        return (float) ($this->precios
            ->where('fecha_inicio', '<=', now()->toDateString())
            ->where(fn ($q) => $q->whereNull('fecha_fin')->orWhere('fecha_fin', '>=', now()->toDateString()))
            ->sortByDesc('fecha_inicio')
            ->first()?->precio_venta ?? 0);
    }
}
