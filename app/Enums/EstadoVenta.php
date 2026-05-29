<?php

declare(strict_types=1);

namespace App\Enums;

enum EstadoVenta: string
{
    case Completado = 'completado';
    case Anulado = 'anulado';
}
