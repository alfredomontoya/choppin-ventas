<?php

declare(strict_types=1);

namespace App\Enums;

enum TipoPago: string
{
    case Efectivo = 'efectivo';
    case Tarjeta = 'tarjeta';
    case Transferencia = 'transferencia';
}
