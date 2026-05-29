<?php

declare(strict_types=1);

namespace App\Enums;

enum RolUsuario: string
{
    case Administrador = 'administrador';
    case Vendedor = 'vendedor';
    case Almacenero = 'almacenero';
    case Supervisor = 'supervisor';
}
