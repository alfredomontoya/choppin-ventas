<?php

declare(strict_types=1);

namespace App\Enums;

enum TipoMovimientoStock: string
{
    case IngresoCompra = 'ingreso_compra';
    case IngresoManual = 'ingreso_manual';
    case IngresoAnulacion = 'ingreso_anulacion';
    case EgresoVenta = 'egreso_venta';
    case EgresoManual = 'egreso_manual';
    case Ajuste = 'ajuste';
}
