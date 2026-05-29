<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    private array $modulos = [
        'ventas', 'clientes', 'productos', 'proveedores',
        'compras', 'empleados', 'almacen', 'reportes',
        'usuarios', 'configuracion',
    ];

    private array $acciones = ['ver', 'crear', 'modificar', 'eliminar', 'exportar'];

    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        foreach ($this->modulos as $modulo) {
            foreach ($this->acciones as $accion) {
                Permission::firstOrCreate(['name' => "{$modulo}.{$accion}"]);
            }
        }

        $admin = Role::firstOrCreate(['name' => 'Administrador']);
        $admin->syncPermissions(Permission::all());

        $vendedor = Role::firstOrCreate(['name' => 'Vendedor']);
        $vendedor->syncPermissions([
            'ventas.ver', 'ventas.crear', 'ventas.exportar',
            'clientes.ver', 'clientes.crear', 'clientes.modificar',
            'productos.ver',
            'almacen.ver',
        ]);

        $almacenero = Role::firstOrCreate(['name' => 'Almacenero']);
        $almacenero->syncPermissions([
            'productos.ver', 'productos.crear', 'productos.modificar',
            'almacen.ver', 'almacen.crear', 'almacen.modificar', 'almacen.exportar',
            'compras.ver', 'compras.crear',
        ]);

        $supervisor = Role::firstOrCreate(['name' => 'Supervisor']);
        $supervisor->syncPermissions([
            'ventas.ver', 'ventas.crear', 'ventas.modificar', 'ventas.exportar',
            'clientes.ver', 'clientes.crear', 'clientes.modificar', 'clientes.exportar',
            'productos.ver', 'productos.exportar',
            'almacen.ver', 'almacen.exportar',
            'reportes.ver', 'reportes.exportar',
            'empleados.ver',
        ]);
    }
}
