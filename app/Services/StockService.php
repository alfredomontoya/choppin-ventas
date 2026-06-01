<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\MovimientoStock;
use App\Models\Producto;
use App\Enums\TipoMovimientoStock;
use Illuminate\Database\Eloquent\Model;

class StockService
{
    public function registrarMovimiento(
        Producto $producto,
        TipoMovimientoStock $tipo,
        float|string $cantidad,
        ?string $motivo = null,
        ?Model $referencia = null,
    ): MovimientoStock {
        $cantidad = (float) $cantidad;
        $esIngreso = in_array($tipo, [
            TipoMovimientoStock::IngresoCompra,
            TipoMovimientoStock::IngresoManual,
        ]);
        $esAjuste = $tipo === TipoMovimientoStock::Ajuste;

        $cantidadFinal = match (true) {
            $esIngreso => abs($cantidad),
            $esAjuste  => $cantidad,
            default    => -abs($cantidad),
        };

        $stockAnterior = $producto->stock_actual;
        $stockPosterior = $stockAnterior + $cantidadFinal;

        return \DB::transaction(function () use ($producto, $tipo, $cantidadFinal, $stockAnterior, $stockPosterior, $motivo, $referencia) {
            $producto->updateQuietly(['stock_actual' => $stockPosterior]);

            return $producto->movimientosStock()->create([
                'user_id' => auth()->id(),
                'tipo' => $tipo->value,
                'cantidad' => abs($cantidadFinal),
                'stock_anterior' => $stockAnterior,
                'stock_posterior' => $stockPosterior,
                'referencia_type' => $referencia ? get_class($referencia) : null,
                'referencia_id' => $referencia?->getKey(),
                'motivo' => $motivo,
            ]);
        });
    }
}
