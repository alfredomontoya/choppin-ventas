<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\TipoMovimientoStock;
use App\Models\CategoriaProducto;
use App\Models\Cliente;
use App\Models\Correlativo;
use App\Models\Producto;
use App\Models\Proveedor;
use App\Models\User;
use App\Models\Venta;
use App\Services\OrdenCompraService;
use App\Services\StockService;
use App\Services\VentaService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::factory()->create([
            'name' => 'Administrador',
            'email' => 'admin@choppin.com',
        ]);
        $admin->assignRole('Administrador');

        $vendedor = User::factory()->create([
            'name' => 'Vendedor Demo',
            'email' => 'vendedor@choppin.com',
        ]);
        $vendedor->assignRole('Vendedor');

        $categorias = CategoriaProducto::factory(3)->create();

        Cliente::factory(20)->create();

        Proveedor::factory(10)->create();

        $productosCreados = 0;
        $porCategoria = [4, 3, 3];

        $categorias->each(function ($cat) use (&$productosCreados, $porCategoria) {
            $total = $porCategoria[$productosCreados] ?? 3;
            $productosCreados++;
            Producto::factory($total)
                ->forCategory($cat)
                ->withPrecio()
                ->create();
        });

        Producto::query()->update(['stock_actual' => 200, 'stock_minimo' => 10]);

        Correlativo::firstOrCreate(['tipo' => 'boleta'], ['ultimo' => 0]);
        Correlativo::firstOrCreate(['tipo' => 'factura'], ['ultimo' => 0]);

        auth()->login($admin);

        $this->crearComprasDemo();
        $this->crearVentasDemo();
        $this->crearMovimientosAlmacenDemo();

        Producto::whereIn('id', Producto::inRandomOrder()->take(4)->pluck('id'))->update([
            'stock_actual' => rand(3, 8),
            'stock_minimo' => 10,
        ]);

        $ultimaBoleta = Venta::where('tipo_comprobante', 'boleta')->withTrashed()->count();
        $ultimaFactura = Venta::where('tipo_comprobante', 'factura')->withTrashed()->count();
        Correlativo::where('tipo', 'boleta')->update(['ultimo' => $ultimaBoleta, 'reiniciar_anual' => true]);
        Correlativo::where('tipo', 'factura')->update(['ultimo' => $ultimaFactura, 'reiniciar_anual' => true]);

        Producto::where('stock_actual', '<', 0)->update(['stock_actual' => 0]);

        if ($this->command) {
            $this->command->call('images:generate-demo');
        }
    }

    private function fechaUniforme(int $index, int $total): Carbon
    {
        $inicio = Carbon::create(2026, 5, 1, 8, 0, 0);
        $fin = now()->copy();
        $segundos = $inicio->diffInSeconds($fin);
        $avance = (int) (($index + 0.5) / $total * $segundos);

        return (clone $inicio)->addSeconds($avance);
    }

    private function crearComprasDemo(): void
    {
        $service = app(OrdenCompraService::class);
        $proveedores = Proveedor::all();
        $productos = Producto::all();

        for ($i = 0; $i < 30; $i++) {
            $proveedor = $proveedores->random();
            $tipo = fake()->randomElement(['boleta', 'factura']);
            $numDetalles = rand(1, 4);
            $detalles = [];
            $usedIds = [];

            for ($j = 0; $j < $numDetalles; $j++) {
                $producto = $productos->whereNotIn('id', $usedIds)->random();
                $usedIds[] = $producto->id;
                $detalles[] = [
                    'producto_id' => $producto->id,
                    'cantidad' => rand(5, 50),
                    'precio_unitario' => $producto->precios->first()?->precio_compra ?? fake()->randomFloat(2, 1, 100),
                ];
            }

            $observaciones = fake()->optional(0.4)->sentence();

            $orden = $service->crearOrden(
                proveedorId: $proveedor->id,
                tipoComprobante: $tipo,
                detalles: $detalles,
                observaciones: $observaciones,
            );

            $fecha = $this->fechaUniforme($i, 30);
            $orden->updateQuietly(['fecha_emision' => $fecha, 'created_at' => $fecha, 'updated_at' => $fecha]);

            if ($i < 20) {
                $recibida = (clone $fecha)->addMinutes(rand(10, 1440));
                $service->recibirOrden($orden);
                $orden->updateQuietly(['updated_at' => $recibida]);
            }
        }
    }

    private function crearVentasDemo(): void
    {
        $service = app(VentaService::class);
        $clientes = Cliente::all();
        $productos = Producto::all();
        $tiposPago = ['efectivo', 'tarjeta', 'transferencia'];

        for ($i = 0; $i < 65; $i++) {
            $cliente = $clientes->random();
            $tipoComprobante = fake()->randomElement(['boleta', 'factura']);
            $tipoPago = $tiposPago[array_rand($tiposPago)];
            $numDetalles = rand(1, 5);
            $detalles = [];

            foreach ($productos->shuffle()->take($numDetalles) as $producto) {
                $detalles[] = [
                    'producto_id' => $producto->id,
                    'cantidad' => rand(1, 8),
                ];
            }

            $montoRecibido = null;
            $cambio = null;
            if (rand(0, 1)) {
                $montoRecibido = fake()->randomFloat(2, 50, 500);
                $cambio = fake()->randomFloat(2, 0, 50);
            }

            $descuento = fake()->optional(0.3)->randomFloat(2, 1, 20) ?? 0;
            $observaciones = fake()->optional(0.3)->sentence();

            $venta = $service->registrarVenta(
                detalles: $detalles,
                tipoComprobante: $tipoComprobante,
                tipoPago: $tipoPago,
                clienteId: $cliente->id,
                descuento: $descuento,
                montoRecibido: $montoRecibido,
                cambio: $cambio,
                observaciones: $observaciones,
            );

            $fecha = $this->fechaUniforme($i, 65);
            $venta->updateQuietly(['fecha_emision' => $fecha, 'created_at' => $fecha, 'updated_at' => $fecha]);

            if ($i < 5) {
                $service->anular($venta->id);
            }
        }
    }

    private function crearMovimientosAlmacenDemo(): void
    {
        $stockService = app(StockService::class);
        $productos = Producto::all();

        $movimientos = [
            ['tipo' => TipoMovimientoStock::IngresoManual, 'cantidad' => 50, 'motivo' => 'Ajuste de inventario inicial'],
            ['tipo' => TipoMovimientoStock::IngresoManual, 'cantidad' => 30, 'motivo' => 'Devolución de cliente por garantía'],
            ['tipo' => TipoMovimientoStock::EgresoManual, 'cantidad' => 10, 'motivo' => 'Merma por rotura de stock'],
            ['tipo' => TipoMovimientoStock::EgresoManual, 'cantidad' => 5, 'motivo' => 'Muestra sin costo para cliente'],
            ['tipo' => TipoMovimientoStock::Ajuste, 'cantidad' => -15, 'motivo' => 'Diferencia encontrada en inventario físico'],
            ['tipo' => TipoMovimientoStock::Ajuste, 'cantidad' => 20, 'motivo' => 'Producto no registrado encontrado en almacén'],
            ['tipo' => TipoMovimientoStock::IngresoManual, 'cantidad' => 100, 'motivo' => 'Compra directa sin orden de compra'],
            ['tipo' => TipoMovimientoStock::EgresoManual, 'cantidad' => 25, 'motivo' => 'Donación a institución benéfica'],
            ['tipo' => TipoMovimientoStock::IngresoManual, 'cantidad' => 60, 'motivo' => 'Excedente de producción interna'],
            ['tipo' => TipoMovimientoStock::Ajuste, 'cantidad' => -8, 'motivo' => 'Corrección por conteo cíclico semanal'],
        ];

        foreach ($movimientos as $mov) {
            $producto = $productos->random();
            $stockService->registrarMovimiento(
                producto: $producto,
                tipo: $mov['tipo'],
                cantidad: $mov['cantidad'],
                motivo: $mov['motivo'],
            );
        }
    }
}
