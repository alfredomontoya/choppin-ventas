<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();

        $tables = [
            'producto_user_favoritos',
            'movimientos_stock',
            'detalle_ventas',
            'ventas',
            'detalle_orden_compra',
            'ordenes_compra',
            'precio_productos',
            'producto_imagenes',
            'productos',
            'empleados',
            'clientes',
            'proveedores',
            'categoria_productos',
            'model_has_roles',
            'model_has_permissions',
            'role_has_permissions',
            'roles',
            'permissions',
            'users',
        ];

        foreach ($tables as $table) {
            DB::table($table)->truncate();
        }

        Schema::enableForeignKeyConstraints();

        $this->call(RolePermissionSeeder::class);
        $this->call(DemoDataSeeder::class);
    }
}
