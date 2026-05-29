<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\PrecioProducto;
use App\Models\Producto;
use Illuminate\Database\Eloquent\Factories\Factory;

class PrecioProductoFactory extends Factory
{
    protected $model = PrecioProducto::class;

    public function definition(): array
    {
        return [
            'producto_id' => Producto::factory(),
            'precio_compra' => fake()->randomFloat(2, 1, 100),
            'precio_venta' => fn(array $attrs) => $attrs['precio_compra'] * 1.3,
            'fecha_inicio' => fake()->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
            'fecha_fin' => null,
        ];
    }
}
