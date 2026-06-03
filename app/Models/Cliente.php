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

class Cliente extends Model
{
    use HasCreadorActualizador, HasEliminador, HasFactory, HasFiltros, SoftDeletes;

    protected $fillable = [
        'nombre',
        'tipo_documento',
        'numero_documento',
        'telefono',
        'email',
        'direccion',
    ];

    public function ventas(): HasMany
    {
        return $this->hasMany(Venta::class);
    }

    public function setNombreAttribute($value): void
    {
        $this->attributes['nombre'] = mb_strtoupper(trim($value));
    }

    public function setNumeroDocumentoAttribute($value): void
    {
        $this->attributes['numero_documento'] = trim($value);
    }

    public function setTelefonoAttribute($value): void
    {
        $this->attributes['telefono'] = $value ? trim($value) : null;
    }

    public function setEmailAttribute($value): void
    {
        $this->attributes['email'] = $value ? mb_strtolower(trim($value)) : null;
    }

    public function setDireccionAttribute($value): void
    {
        $this->attributes['direccion'] = $value ? mb_strtoupper(trim($value)) : null;
    }

    public function getSearchColumns(): array
    {
        return ['nombre', 'numero_documento', 'telefono', 'email'];
    }
}
