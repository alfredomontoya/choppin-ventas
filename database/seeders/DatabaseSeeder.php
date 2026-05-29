<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\CategoriaProducto;
use App\Models\Cliente;
use App\Models\PrecioProducto;
use App\Models\Producto;
use App\Models\Proveedor;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RolePermissionSeeder::class);

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

        $categorias = CategoriaProducto::factory(10)->create();

        Cliente::factory(20)->create();

        Proveedor::factory(10)->create();

        $categorias->each(function ($cat) {
            Producto::factory(5)
                ->forCategory($cat)
                ->withPrecio()
                ->create();
        });
    }
}
