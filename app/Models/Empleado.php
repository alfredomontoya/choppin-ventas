<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\HasCreadorActualizador;
use App\Traits\HasEliminador;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Empleado extends Model
{
    protected $table = 'empleados';

    use HasCreadorActualizador, HasEliminador, HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'nombre',
        'apellido',
        'tipo_documento',
        'numero_documento',
        'telefono',
        'email',
        'cargo',
        'fecha_contratacion',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'fecha_contratacion' => 'date',
            'activo' => 'boolean',
        ];
    }

    public function setNombreAttribute($value): void
    {
        $this->attributes['nombre'] = mb_strtoupper(trim($value));
    }

    public function setApellidoAttribute($value): void
    {
        $this->attributes['apellido'] = mb_strtoupper(trim($value));
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

    public function setCargoAttribute($value): void
    {
        $this->attributes['cargo'] = $value ? mb_strtoupper(trim($value)) : null;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
