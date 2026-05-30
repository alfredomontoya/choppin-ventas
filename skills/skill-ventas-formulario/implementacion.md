# Skill — Formulario de Venta Mejorado

Implementa un formulario de venta con autocompletado para cliente y productos, radio buttons para tipo de pago, productos favoritos por usuario, y layout de dos columnas.

## Stack

| Aspecto | Decisión |
|---|---|
| Búsqueda | 100% cliente (sin AJAX), filter local |
| Autocomplete reutilizable | Componente `Autocomplete` genérico con slots para render personalizado |
| Favoritos | Tabla pivote `producto_user_favoritos`, toggle desde Index de Productos |
| Layout venta | 2 columnas: izq (cliente, pago, comprobante, descuento) — der (productos, favoritos, detalle, totales) |

## Archivos a crear/editar

### Backend

| Archivo | Acción |
|---|---|
| `database/migrations/xxxx_xx_xx_xxxxxx_create_producto_user_favoritos_table.php` | Crear |
| `app/Models/Producto.php` | Editar — agregar relación `favoritos()` y accessor `precioVenta` |
| `app/Models/User.php` | Editar — agregar relación `productosFavoritos()` |
| `app/Http/Controllers/VentaController.php` | Editar — pasar `productosFavoritos` al create |
| `app/Http/Controllers/ProductoController.php` | Editar — agregar método `toggleFavorito` |
| `routes/web.php` | Editar — agregar ruta toggleFavorito |

### Frontend

| Archivo | Acción |
|---|---|
| `resources/js/Components/ui/Autocomplete.tsx` | Crear — componente reutilizable de autocompletado |
| `resources/js/Components/ui/FavoritosGrid.tsx` | Crear — grid horizontal de productos favoritos |
| `resources/js/Pages/Ventas/Form.tsx` | Editar — refactor completo a 2 columnas con autocomplete + radios + favoritos |
| `resources/js/Pages/Ventas/Create.tsx` | Editar — pasar `productosFavoritos` |
| `resources/js/Pages/Productos/Index.tsx` | Editar — agregar columna favorito con toggle |

## 1. Migración — tabla pivote de favoritos

```php
Schema::create('producto_user_favoritos', function (Blueprint $table) {
    $table->foreignId('producto_id')->constrained('productos')->cascadeOnDelete();
    $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
    $table->timestamps();
    $table->primary(['producto_id', 'user_id']);
});
```

## 2. Modelo Producto — relación favoritos + accessor precio_venta

```php
// Relación
public function favoritos(): BelongsToMany
{
    return $this->belongsToMany(User::class, 'producto_user_favoritos')
        ->withTimestamps();
}

// Accessor
public function getPrecioVentaAttribute(): float
{
    return (float) ($this->precios
        ->where('fecha_inicio', '<=', now()->toDateString())
        ->where(fn ($q) => $q->whereNull('fecha_fin')->orWhere('fecha_fin', '>=', now()->toDateString()))
        ->sortByDesc('fecha_inicio')
        ->first()?->precio_venta ?? 0);
}
```

Agregar `'precio_venta'` a `$appends` si se quiere incluir siempre en JSON.

## 3. Modelo User — relación productos favoritos

```php
public function productosFavoritos(): BelongsToMany
{
    return $this->belongsToMany(Producto::class, 'producto_user_favoritos')
        ->withTimestamps()
        ->with(['categoria', 'precios']);
}
```

## 4. Backend — ProductoController toggle favorito + ruta

```php
public function toggleFavorito(Producto $producto): JsonResponse
{
    $user = auth()->user();
    $esFavorito = $user->productosFavoritos()->toggle($producto->id);
    return response()->json([
        'favorito' => count($esFavorito['attached']) > 0,
    ]);
}
```

Ruta en `routes/web.php`:
```php
Route::post('productos/{producto}/favorito', [ProductoController::class, 'toggleFavorito'])
    ->name('productos.favorito');
```

## 5. Componente Autocomplete

Props genéricas: `items`, `filterFn`, `renderItem`, `onSelect`, `placeholder`.
Soporta flechas arriba/abajo, Enter, Escape, click.
Renderiza un dropdown absolute con los items filtrados.

## 6. Componente FavoritosGrid

Grid horizontal de 1 fila con scroll. Cada tarjeta: imagen, categoría, nombre, precio.
Click agrega el producto al detalle de venta con cantidad 1.

## 7. Formulario de Venta — layout 2 columnas

**Columna izquierda:**
- Autocomplete Cliente (busca por nombre + apellido + numero_documento)
- Tipo Comprobante (select: boleta / factura)
- Tipo Pago (radio buttons: efectivo, tarjeta, transferencia)
- Descuento (input numérico)

**Columna derecha:**
- Autocomplete Producto (render con imagen thumbnail, categoría, nombre, precio)
- FavoritosGrid (productos favoritos del usuario)
- Tabla de detalle (edición inline de cantidad, botón eliminar)
- Totales (subtotal, descuento, total)

**Abajo (full width):**
- Observaciones (textarea)
- Botones Guardar/Cancelar

## 8. Índice de productos — columna favorito

Agregar columna con botón estrella. Recibir `productosFavoritos: number[]` como prop.
Toggle visual optimista + POST a `route('productos.favorito', id)`.
