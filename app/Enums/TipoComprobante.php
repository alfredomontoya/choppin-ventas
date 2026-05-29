<?php

declare(strict_types=1);

namespace App\Enums;

enum TipoComprobante: string
{
    case Boleta = 'boleta';
    case Factura = 'factura';
}
