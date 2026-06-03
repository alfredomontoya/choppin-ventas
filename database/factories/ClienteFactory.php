<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Cliente;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClienteFactory extends Factory
{
    protected $model = Cliente::class;

    public function definition(): array
    {
        return [
            'nombre' => fake()->firstName() . ' ' . fake()->lastName(),
            'tipo_documento' => fake()->randomElement(['ci', 'ce', 'nit']),
            'numero_documento' => fake()->unique()->numerify('###########'),
            'telefono' => fake()->phoneNumber(),
            'email' => fake()->email(),
            'direccion' => fake()->address(),
        ];
    }
}
