<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\HasCreadorActualizador;
use App\Traits\HasEliminador;
use App\Traits\HasFiltros;

class Venta extends Model
{
    protected $table = 'ventas';

    use SoftDeletes, HasCreadorActualizador, HasEliminador, HasFiltros;

    protected $fillable = [
        'user_id',
        'cliente_id',
        'numero_comprobante',
        'tipo_comprobante',
        'fecha_emision',
        'moneda',
        'tipo_cambio',
        'subtotal',
        'igv',
        'descuento',
        'total',
        'monto_recibido',
        'cambio',
        'tipo_pago',
        'observaciones',
        'estado',
    ];

    protected function casts(): array
    {
        return [
            'fecha_emision' => 'datetime',
            'tipo_cambio' => 'decimal:4',
            'subtotal' => 'decimal:2',
            'igv' => 'decimal:2',
            'descuento' => 'decimal:2',
            'total' => 'decimal:2',
            'monto_recibido' => 'decimal:2',
            'cambio' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }

    public function detalle(): HasMany
    {
        return $this->hasMany(DetalleVenta::class);
    }

    public function getSearchColumns(): array
    {
        return ['numero_comprobante', 'observaciones'];
    }
}
