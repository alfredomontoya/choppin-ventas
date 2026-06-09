<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\HasCreadorActualizador;
use App\Traits\HasEliminador;
use App\Traits\HasFiltros;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrdenCompra extends Model
{
    protected $table = 'ordenes_compra';

    use HasCreadorActualizador, HasEliminador, HasFiltros, SoftDeletes;

    protected $fillable = [
        'proveedor_id',
        'user_id',
        'numero_comprobante',
        'tipo_comprobante',
        'fecha_emision',
        'moneda',
        'tipo_cambio',
        'subtotal',
        'iva',
        'total',
        'observaciones',
        'estado',
    ];

    protected function casts(): array
    {
        return [
            'fecha_emision' => 'datetime',
            'tipo_cambio' => 'decimal:4',
            'subtotal' => 'decimal:2',
            'iva' => 'decimal:2',
            'total' => 'decimal:2',
        ];
    }

    public function getSearchColumns(): array
    {
        return ['numero_comprobante', 'observaciones'];
    }

    public function proveedor(): BelongsTo
    {
        return $this->belongsTo(Proveedor::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function detalle(): HasMany
    {
        return $this->hasMany(DetalleOrdenCompra::class);
    }
}
