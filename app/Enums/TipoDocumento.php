<?php

declare(strict_types=1);

namespace App\Enums;

enum TipoDocumento: string
{
    case Dni = 'dni';
    case Ce = 'ce';
    case Ruc = 'ruc';
}
