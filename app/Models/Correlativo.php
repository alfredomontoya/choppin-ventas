<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Correlativo extends Model
{
    protected $table = 'correlativos';

    protected $fillable = [
        'tipo',
        'ultimo',
        'reiniciar_anual',
        'year',
        'ultimo_reset_en',
    ];

    protected function casts(): array
    {
        return [
            'ultimo' => 'integer',
            'reiniciar_anual' => 'boolean',
            'year' => 'integer',
            'ultimo_reset_en' => 'datetime',
        ];
    }

    public function resets(): HasMany
    {
        return $this->hasMany(CorrelativoReset::class, 'correlativo_id');
    }
}
