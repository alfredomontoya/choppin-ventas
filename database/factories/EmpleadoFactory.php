<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Empleado;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class EmpleadoFactory extends Factory
{
    protected $model = Empleado::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'nombre' => fake()->firstName(),
            'apellido' => fake()->lastName(),
            'tipo_documento' => 'dni',
            'numero_documento' => fake()->unique()->numerify('########'),
            'telefono' => fake()->phoneNumber(),
            'email' => fake()->email(),
            'cargo' => fake()->randomElement(['Vendedor', 'Cajero', 'Almacenero', 'Supervisor']),
            'fecha_contratacion' => fake()->dateTimeBetween('-2 years', 'now')->format('Y-m-d'),
            'activo' => true,
        ];
    }
}
