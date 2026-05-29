<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Proveedor;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProveedorFactory extends Factory
{
    protected $model = Proveedor::class;

    public function definition(): array
    {
        return [
            'nombre' => fake()->company(),
            'contacto' => fake()->name(),
            'telefono' => fake()->phoneNumber(),
            'email' => fake()->companyEmail(),
            'direccion' => fake()->address(),
            'nit_ci' => fake()->unique()->numerify('###########'),
            'activo' => true,
        ];
    }
}
