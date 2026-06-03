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

class Proveedor extends Model
{
    protected $table = 'proveedores';

    use HasCreadorActualizador, HasEliminador, HasFactory, HasFiltros, SoftDeletes;

    protected $fillable = [
        'nombre',
        'contacto',
        'telefono',
        'email',
        'direccion',
        'nit_ci',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'activo' => 'boolean',
        ];
    }

    public function ordenesCompra(): HasMany
    {
        return $this->hasMany(OrdenCompra::class);
    }

    public function setNombreAttribute($value): void
    {
        $this->attributes['nombre'] = mb_strtoupper(trim($value));
    }

    public function setContactoAttribute($value): void
    {
        $this->attributes['contacto'] = $value ? mb_strtoupper(trim($value)) : null;
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

    public function setNitCiAttribute($value): void
    {
        $this->attributes['nit_ci'] = $value ? mb_strtoupper(trim($value)) : null;
    }

    public function getSearchColumns(): array
    {
        return ['nombre', 'contacto', 'telefono', 'email', 'nit_ci'];
    }
}
