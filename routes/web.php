<?php

declare(strict_types=1);

use App\Http\Controllers\AlmacenController;
use App\Http\Controllers\CategoriaProductoController;
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OrdenCompraController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProveedorController;
use App\Http\Controllers\ReporteController;
use App\Http\Controllers\VentaController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', DashboardController::class)->middleware('auth')->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('clientes/exportar', [ClienteController::class, 'exportar'])->name('clientes.exportar')->middleware('permission:clientes.ver');
    Route::resource('clientes', ClienteController::class)->middleware('permission:clientes.ver');

    Route::get('proveedores/exportar', [ProveedorController::class, 'exportar'])->name('proveedores.exportar')->middleware('permission:proveedores.ver');
    Route::resource('proveedores', ProveedorController::class)->middleware('permission:proveedores.ver');

    Route::get('categoria-productos/exportar', [CategoriaProductoController::class, 'exportar'])->name('categoria_productos.exportar')->middleware('permission:productos.ver');
    Route::resource('categoria-productos', CategoriaProductoController::class)->names('categoria_productos')->middleware('permission:productos.ver');

    Route::get('productos/exportar', [ProductoController::class, 'exportar'])->name('productos.exportar')->middleware('permission:productos.ver');
    Route::post('productos/{producto}/favorito', [ProductoController::class, 'toggleFavorito'])->name('productos.favorito');
    Route::resource('productos', ProductoController::class)->middleware('permission:productos.ver');

    Route::get('ventas/exportar', [VentaController::class, 'exportar'])->name('ventas.exportar')->middleware('permission:ventas.ver');
    Route::get('ventas/{venta}/imprimir', [VentaController::class, 'imprimir'])->name('ventas.imprimir');
    Route::resource('ventas', VentaController::class)->middleware('permission:ventas.ver');

    Route::get('compras/exportar', [OrdenCompraController::class, 'exportar'])->name('compras.exportar')->middleware('permission:compras.ver');
    Route::get('compras/{compra}/verificar-precios', [OrdenCompraController::class, 'verificarPrecios'])->name('compras.verificar-precios')->middleware('permission:compras.ver');
    Route::post('compras/{ordene}/recibir', [OrdenCompraController::class, 'recibir'])->name('compras.recibir')->middleware('permission:compras.ver');
    Route::resource('compras', OrdenCompraController::class)->middleware('permission:compras.ver');

    Route::get('almacen/exportar', [AlmacenController::class, 'exportar'])->name('almacen.exportar')->middleware('permission:almacen.ver');
    Route::resource('almacen', AlmacenController::class)->only(['index', 'create', 'store', 'show'])->middleware('permission:almacen.ver');

    Route::get('notificaciones', [ReporteController::class, 'notificaciones'])->name('notificaciones')->middleware('auth');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::prefix('reportes')->name('reportes.')->middleware('permission:reportes.ver')->group(function () {
        Route::get('/', [ReporteController::class, 'index'])->name('index');
        Route::get('ventas', [ReporteController::class, 'ventas'])->name('ventas');
        Route::get('compras', [ReporteController::class, 'compras'])->name('compras');
        Route::get('rentabilidad', [ReporteController::class, 'rentabilidad'])->name('rentabilidad');
        Route::get('movimientos', [ReporteController::class, 'movimientos'])->name('movimientos');
        Route::get('clientes', [ReporteController::class, 'clientes'])->name('clientes');
    });
});

require __DIR__ . '/auth.php';
require __DIR__ . '/admin.php';
