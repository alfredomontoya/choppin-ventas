<?php

declare(strict_types=1);

namespace App\Traits;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait HasCreadorActualizador
{
    public static function bootHasCreadorActualizador(): void
    {
        static::creating(function ($model) {
            if (auth()->check() && ! $model->isDirty('created_by')) {
                $model->created_by = auth()->id();
            }
            if (auth()->check() && ! $model->isDirty('updated_by')) {
                $model->updated_by = auth()->id();
            }
        });

        static::updating(function ($model) {
            if (auth()->check()) {
                $model->updated_by = auth()->id();
            }
        });
    }

    public function creador(): BelongsTo
    {
        return $this->belongsTo(config('auth.providers.users.model'), 'created_by');
    }

    public function actualizador(): BelongsTo
    {
        return $this->belongsTo(config('auth.providers.users.model'), 'updated_by');
    }
}
