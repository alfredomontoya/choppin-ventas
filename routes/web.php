<?php

use App\Http\Controllers\CategoriaProductoController;
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\OrdenCompraController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\ProveedorController;
use App\Http\Controllers\VentaController;
use App\Http\Controllers\AlmacenController;
use App\Http\Controllers\ProfileController;
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

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard/Index');
})->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('clientes/exportar', [ClienteController::class, 'exportar'])->name('clientes.exportar');
    Route::resource('clientes', ClienteController::class);

    Route::get('proveedores/exportar', [ProveedorController::class, 'exportar'])->name('proveedores.exportar');
    Route::resource('proveedores', ProveedorController::class);

    Route::get('categoria-productos/exportar', [CategoriaProductoController::class, 'exportar'])->name('categoria_productos.exportar');
    Route::resource('categoria-productos', CategoriaProductoController::class)->names('categoria_productos');

    Route::get('productos/exportar', [ProductoController::class, 'exportar'])->name('productos.exportar');
    Route::post('productos/{producto}/favorito', [ProductoController::class, 'toggleFavorito'])->name('productos.favorito');
    Route::resource('productos', ProductoController::class);

    Route::get('ventas/exportar', [VentaController::class, 'exportar'])->name('ventas.exportar');
    Route::get('ventas/{venta}/imprimir', [VentaController::class, 'imprimir'])->name('ventas.imprimir');
    Route::resource('ventas', VentaController::class);

    Route::get('compras/exportar', [OrdenCompraController::class, 'exportar'])->name('compras.exportar');
    Route::get('compras/{compra}/verificar-precios', [OrdenCompraController::class, 'verificarPrecios'])->name('compras.verificar-precios');
    Route::post('compras/{ordene}/recibir', [OrdenCompraController::class, 'recibir'])->name('compras.recibir');
    Route::resource('compras', OrdenCompraController::class);

    Route::get('almacen/exportar', [AlmacenController::class, 'exportar'])->name('almacen.exportar');
    Route::resource('almacen', AlmacenController::class)->only(['index', 'create', 'store', 'show']);

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
