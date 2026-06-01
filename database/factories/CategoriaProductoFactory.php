<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\CategoriaProducto;
use Illuminate\Database\Eloquent\Factories\Factory;

class CategoriaProductoFactory extends Factory
{
    protected $model = CategoriaProducto::class;

    protected static $nombres = [
        'Ropa Hombre',
        'Ropa Mujer',
        'Accesorios',
    ];

    protected static $index = 0;

    public function definition(): array
    {
        $nombre = static::$nombres[static::$index % count(static::$nombres)];
        static::$index++;

        return [
            'nombre' => $nombre,
            'descripcion' => "{$nombre} — categoría de prendas de vestir.",
            'imagen' => fake()->imageUrl(640, 480, 'clothing', true),
            'activo' => true,
        ];
    }
}
