<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CorrelativoReset extends Model
{
    protected $table = 'correlativo_resets';

    protected $fillable = [
        'correlativo_id',
        'tipo',
        'ultimo_anterior',
        'user_id',
        'glosa',
    ];

    protected function casts(): array
    {
        return [
            'ultimo_anterior' => 'integer',
        ];
    }

    public function correlativo(): BelongsTo
    {
        return $this->belongsTo(Correlativo::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
