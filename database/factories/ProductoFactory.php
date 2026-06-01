<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\CategoriaProducto;
use App\Models\PrecioProducto;
use App\Models\Producto;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductoFactory extends Factory
{
    protected $model = Producto::class;

    public function definition(): array
    {
        return [
            'categoria_id' => CategoriaProducto::factory(),
            'codigo' => fake()->unique()->bothify('PRO-#####'),
            'nombre' => fake()->word(),
            'descripcion' => fake()->sentence(),
            'stock_actual' => fake()->numberBetween(0, 500),
            'stock_minimo' => fake()->numberBetween(0, 20),
            'unidad_medida' => fake()->randomElement(['unidad', 'kg', 'litro', 'caja', 'pack']),
            'activo' => true,
        ];
    }

    public function forCategory(CategoriaProducto $category): static
    {
        return $this->state(fn(array $attrs) => [
            'categoria_id' => $category->id,
        ]);
    }

    public function withPrecio(): static
    {
        return $this->afterCreating(function (Producto $producto) {
            PrecioProducto::factory()->create([
                'producto_id' => $producto->id,
                'precio_compra' => fake()->randomFloat(2, 1, 100),
                'precio_venta' => fake()->randomFloat(2, 5, 200),
                'fecha_inicio' => now()->subMonth()->format('Y-m-d'),
                'fecha_fin' => null,
            ]);
        });
    }
}
