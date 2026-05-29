<?php

declare(strict_types=1);

namespace App\Enums;

enum EstadoOrdenCompra: string
{
    case Pendiente = 'pendiente';
    case Recibido = 'recibido';
    case Anulado = 'anulado';
}
