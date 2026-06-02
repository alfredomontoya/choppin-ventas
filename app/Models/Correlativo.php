<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Correlativo extends Model
{
    protected $table = 'correlativos';

    protected $fillable = [
        'tipo',
        'ultimo',
    ];

    protected function casts(): array
    {
        return [
            'ultimo' => 'integer',
        ];
    }
}
