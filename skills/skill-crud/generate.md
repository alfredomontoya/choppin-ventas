# Skill CRUD Generator

Genera un CRUD completo para una entidad del sistema Choppín, siguiendo la arquitectura estandarizada con Service Layer, Form Requests, HasFiltros (Trait), y exportación a Excel.

## Stack

| Aspecto | Decisión |
|---|---|
| Idioma rutas | Español (`/clientes`, `ClientesController`) |
| Excel | Servidor con `maatwebsite/laravel-excel` |
| Toast | `react-hot-toast` |
| Capa de servicio | `App\Services\{Entidad}Service` |
| Filtros/Orden | `App\Traits\HasFiltros` |
| UI | Tailwind CSS + `@headlessui/react` + componentes propios |

## Archivos a crear/editar por entidad

### Backend

```
app/Http/Controllers/{Entidad}Controller.php
app/Http/Requests/Store{Entidad}Request.php
app/Http/Requests/Update{Entidad}Request.php
app/Http/Exports/{Entidad}Export.php
app/Services/{Entidad}Service.php
routes/web.php (agregar rutas)
```

### Frontend

```
resources/js/Pages/{Entidad}/
  ├── Index.tsx
  ├── Create.tsx
  ├── Edit.tsx
  ├── Form.tsx
  └── Show.tsx
```

### Compartidos (crear una sola vez, ya existen)

```
resources/js/Components/ui/
  ├── TableHeader.tsx        ← Columna ordenable
  ├── Pagination.tsx         ← Paginador con selector de registros
  ├── ConfirmDialog.tsx      ← Modal de confirmación
  └── HighlightText.tsx      ← Resalta coincidencias de búsqueda
```

## Permisos y Roles

### Convención de nombres

Cada entidad genera 4 permisos con el formato `{entidad_plural}:{accion}`:

| Permiso | Middleware | Descripción |
|---|---|---|
| `clientes:listar` | `can:clientes:listar` | Ver listado y exportar |
| `clientes:crear` | `can:clientes:crear` | Crear nuevos registros |
| `clientes:editar` | `can:clientes:editar` | Editar registros existentes |
| `clientes:eliminar` | `can:clientes:eliminar` | Eliminar registros |

### Roles predefinidos del sistema

| Rol | Permisos asignados |
|---|---|
| `Administrador` | Todos los permisos |
| `Vendedor` | Ventas:listar, Ventas:crear, Clientes:listar, Clientes:crear, Clientes:editar |
| `Almacenero` | Productos:listar, Productos:crear, Productos:editar, Almacen:listar |
| `Supervisor` | Todos los permisos de lectura + Reportes |

### Seeders

Crear un seeder que registre permisos y roles al ejecutar `php artisan db:seed`:

```
database/seeders/
  ├── DatabaseSeeder.php
  └── RolesYPermisosSeeder.php
```

`RolesYPermisosSeeder.php`:
```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesYPermisosSeeder extends Seeder
{
    public function run(): void
    {
        // Registrar permisos de cada módulo
        $modulos = [
            'usuarios' => ['listar', 'crear', 'editar', 'eliminar'],
            'clientes' => ['listar', 'crear', 'editar', 'eliminar'],
            'proveedores' => ['listar', 'crear', 'editar', 'eliminar'],
            'productos' => ['listar', 'crear', 'editar', 'eliminar'],
            'ventas' => ['listar', 'crear', 'editar', 'eliminar'],
            'compras' => ['listar', 'crear', 'editar', 'eliminar'],
            'almacen' => ['listar'],
            'reportes' => ['listar'],
        ];

        foreach ($modulos as $modulo => $acciones) {
            foreach ($acciones as $accion) {
                Permission::firstOrCreate(['name' => "{$modulo}:{$accion}"]);
            }
        }

        // Crear roles y asignar permisos
        $admin = Role::firstOrCreate(['name' => 'Administrador']);
        $admin->syncPermissions(Permission::all());

        $vendedor = Role::firstOrCreate(['name' => 'Vendedor']);
        $vendedor->syncPermissions([
            'clientes:listar', 'clientes:crear', 'clientes:editar',
            'ventas:listar', 'ventas:crear',
        ]);

        $almacenero = Role::firstOrCreate(['name' => 'Almacenero']);
        $almacenero->syncPermissions([
            'productos:listar', 'productos:crear', 'productos:editar',
            'almacen:listar',
        ]);

        $supervisor = Role::firstOrCreate(['name' => 'Supervisor']);
        $supervisor->syncPermissions(Permission::all()->filter(fn($p) => str_contains($p->name, ':listar')));
    }
}
```

### Compartir permisos con Inertia

Actualizar `app/Http/Middleware/HandleInertiaRequests.php` para compartir los permisos del usuario autenticado:

```php
public function share(Request $request): array
{
    return [
        ...parent::share($request),
        'auth' => [
            'user' => $request->user(),
            'permissions' => $request->user()?->getAllPermissions()->pluck('name') ?? [],
        ],
        'flash' => [
            'success' => $request->session()->get('success'),
            'error' => $request->session()->get('error'),
        ],
    ];
}
```

## Rutas con middleware

### Configuración de rutas

En `routes/web.php`, las rutas del CRUD deben protegerse con middleware `auth` y `can`:

```php
use App\Http\Controllers\{Entidad}Controller;

Route::middleware(['auth', 'verified'])->group(function () {

    // Rutas de listado y exportación requieren permiso de listar
    Route::get('{entidad_plural}', [{Entidad}Controller::class, 'index'])
        ->middleware('can:{entidad_plural}:listar')
        ->name('{entidad_plural}.index');

    Route::get('{entidad_plural}/exportar', [{Entidad}Controller::class, 'exportar'])
        ->middleware('can:{entidad_plural}:listar')
        ->name('{entidad_plural}.exportar');

    // Crear requiere permiso de crear
    Route::get('{entidad_plural}/crear', [{Entidad}Controller::class, 'create'])
        ->middleware('can:{entidad_plural}:crear')
        ->name('{entidad_plural}.create');

    Route::post('{entidad_plural}', [{Entidad}Controller::class, 'store'])
        ->middleware('can:{entidad_plural}:crear')
        ->name('{entidad_plural}.store');

    // Ver detalle requiere permiso de listar
    Route::get('{entidad_plural}/{entidad_singular}', [{Entidad}Controller::class, 'show'])
        ->middleware('can:{entidad_plural}:listar')
        ->name('{entidad_plural}.show');

    // Editar requiere permiso de editar
    Route::get('{entidad_plural}/{entidad_singular}/editar', [{Entidad}Controller::class, 'edit'])
        ->middleware('can:{entidad_plural}:editar')
        ->name('{entidad_plural}.edit');

    Route::match(['put', 'patch'], '{entidad_plural}/{entidad_singular}', [{Entidad}Controller::class, 'update'])
        ->middleware('can:{entidad_plural}:editar')
        ->name('{entidad_plural}.update');

    // Eliminar requiere permiso de eliminar
    Route::delete('{entidad_plural}/{entidad_singular}', [{Entidad}Controller::class, 'destroy'])
        ->middleware('can:{entidad_plural}:eliminar')
        ->name('{entidad_plural}.destroy');
});
```

> **Alternativa**: Usar `Route::resource` con middleware aplicado al group:
> ```php
> Route::middleware(['auth', 'verified'])->group(function () {
>     Route::resource('{entidad_plural}', {Entidad}Controller::class)->middleware('can:{entidad_plural}:listar');
> });
> ```
> Luego dentro del controlador se afinan permisos individuales con `$this->authorize()` o el middleware `can` en el constructor.

### Autorización en el Controller (opcional)

Si se prefiere usar Policy o Gate en lugar de middleware en rutas:

```php
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class {Entidad}Controller extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected {Entidad}Service $service,
    ) {
        $this->authorizeResource({Entidad}::class, '{entidad_singular}');
    }
}
```

Requiere crear una Policy que defina `viewAny`, `view`, `create`, `update`, `delete`.

## Frontend con permisos

### Ocultar botones según permisos

Usar el componente `Can` para mostrar/ocultar elementos según los permisos del usuario:

```tsx
import { Can } from '@/Components/Can';

// En Index.tsx — ocultar botón "Nuevo" si no tiene permiso
<Can permission="clientes:crear">
  <Link href={route('clientes.create')} className="...">
    + Nuevo Cliente
  </Link>
</Can>

// En la tabla — ocultar acciones según permisos
<Can permission="clientes:editar">
  <Link href={route('clientes.edit', item.id)} ...>✏️</Link>
</Can>

<Can permission="clientes:eliminar">
  <button onClick={() => confirmarEliminar(item.id)} ...>🗑</button>
</Can>

// En el menú lateral — ocultar módulo si no tiene permiso
import { usePermission } from '@/hooks/usePermission';

const { can } = usePermission();
// En el array navigation, filtrar:
navigation.filter(item => can(`${item.name.toLowerCase()}:listar`) || item.name === 'Dashboard')
```

### Renderizado condicional en NavLink

```tsx
{/* En DashboardLayout.tsx — mostrar items del menú solo si tiene permiso */}
{navigation.filter(item => {
  if (item.name === 'Dashboard') return true;
  return can(`${item.name.toLowerCase()}:listar`);
}).map((item) => (
  <Link key={item.name} ...>
    ...
  </Link>
))}
```

## Resumen del flujo completo de autorización

```
Usuario autenticado
       │
       ▼
HandleInertiaRequests comparte auth.user + auth.permissions[]
       │
       ▼
Rutas protegidas con middleware → can:clientes:listar
       │
       ▼
Controlador ejecuta acción solo si pasa el middleware
       │
       ▼
Frontend usa <Can> y usePermission() para UI condicional
       │
       ▼
Usuario sin permiso no ve botones ni accede a rutas
```

## Actualizar el Sidebar

Cada vez que se crea un nuevo módulo CRUD, se debe agregar su enlace en el sidebar del DashboardLayout.

### Editar `resources/js/Layouts/DashboardLayout.tsx`

Agregar la entrada en el array `navigation` con la ruta correspondiente:

```tsx
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '◻' },
  { name: 'Ventas', href: '/ventas', icon: '🛒' },
  { name: 'Clientes', href: '/clientes', icon: '👥' },        // ← agregar aquí
  { name: 'Productos', href: '/productos', icon: '📦' },
  { name: 'Proveedores', href: '/proveedores', icon: '🚚' },
  { name: 'Compras', href: '/compras', icon: '📋' },
  { name: 'Almacén', href: '/almacen', icon: '🏭' },
  { name: 'Reportes', href: '/reportes', icon: '📊' },
  { name: 'Admin', href: '/admin', icon: '⚙' },
];
```

### Sidebar con permisos (opcional)

Para que los módulos solo aparezcan si el usuario tiene el permiso correspondiente, filtrar el array `navigation` usando `usePermission()`:

```tsx
import { usePermission } from '@/hooks/usePermission';

// Dentro del componente:
const { can } = usePermission();

// En el map, filtrar:
{navigation.filter(item => {
  if (item.name === 'Dashboard') return true;
  return can(`${item.name.toLowerCase()}:listar`);
}).map((item) => (
  <Link key={item.name} href={item.href} ...>
    <span>{item.icon}</span>
    <span>{item.name}</span>
  </Link>
))}
```

## Paso a paso para generar un CRUD

### 1. Crear el Service

`app/Services/{Entidad}Service.php`

```php
<?php

namespace App\Services;

use App\Models\{Entidad};
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class {Entidad}Service
{
    public function listar(Request $request)
    {
        return {Entidad}::query()
            ->applyFilters($request)
            ->applySorting($request)
            ->paginate($request->input('por_pagina', 10))
            ->withQueryString();
    }

    public function obtenerPorId(int $id): {Entidad}
    {
        return {Entidad}::findOrFail($id);
    }

    public function crear(array $data): {Entidad}
    {
        return {Entidad}::create($data);
    }

    public function actualizar(int $id, array $data): {Entidad}
    {
        $entidad = $this->obtenerPorId($id);
        $entidad->update($data);
        return $entidad;
    }

    public function eliminar(int $id): void
    {
        $entidad = $this->obtenerPorId($id);
        $entidad->delete();
    }

    public function queryParaExportar(Request $request)
    {
        return {Entidad}::query()->applyFilters($request);
    }
}
```

### 2. Crear el Controller

`app/Http/Controllers/{Entidad}Controller.php`

```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Exports\{Entidad}Export;
use App\Http\Requests\Store{Entidad}Request;
use App\Http\Requests\Update{Entidad}Request;
use App\Services\{Entidad}Service;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class {Entidad}Controller extends Controller
{
    public function __construct(
        protected {Entidad}Service $service,
    ) {}

    public function index(Request $request)
    {
        return inertia('{Entidad}/Index', [
            '{entidad_plural}' => $this->service->listar($request),
            'filtros' => $request->only(['busqueda', 'orden', 'direccion', 'por_pagina']),
        ]);
    }

    public function create(Request $request)
    {
        return inertia('{Entidad}/Create', [
            'return_url' => $request->query('return_url') ?: url()->previous(),
        ]);
    }

    public function store(Store{Entidad}Request $request)
    {
        $entidad = $this->service->crear($request->validated());

        return redirect()->route('{entidad_plural}.show', $entidad)
            ->with('success', ucfirst(__('{entidad_singular} creado correctamente.')))
            ->with('url_anterior', $request->input('return_url') ?: route('{entidad_plural}.index'));
    }

    public function show(int $id)
    {
        return inertia('{Entidad}/Show', [
            '{entidad_singular}' => $this->service->obtenerPorId($id),
            'url_anterior' => session('url_anterior') ?: url()->previous() ?: route('{entidad_plural}.index'),
        ]);
    }

    public function update(Update{Entidad}Request $request, int $id)
    {
        $this->service->actualizar($id, $request->validated());

        return redirect()->route('{entidad_plural}.show', $id)
            ->with('success', ucfirst(__('{entidad_singular} actualizado correctamente.')))
            ->with('url_anterior', $request->input('return_url') ?: route('{entidad_plural}.index'));
    }

    public function edit(int $id, Request $request)
    {
        return inertia('{Entidad}/Edit', [
            '{entidad_singular}' => $this->service->obtenerPorId($id),
            'return_url' => $request->query('return_url') ?: url()->previous(),
        ]);
    }

    public function destroy(int $id)
    {
        $this->service->eliminar($id);

        return redirect()->route('{entidad_plural}.index')
            ->with('success', ucfirst(__('{entidad_singular} eliminado correctamente.')));
    }

    public function exportar(Request $request)
    {
        return Excel::download(
            new {Entidad}Export($request),
            '{entidad_plural}.xlsx'
        );
    }
}
```

### 3. Crear Form Requests

`app/Http/Requests/Store{Entidad}Request.php`

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class Store{Entidad}Request extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // TODO: agregar reglas específicas de la entidad
        ];
    }

    public function messages(): array
    {
        return [
            // 'campo.required' => 'El campo :attribute es obligatorio.',
        ];
    }
}
```

`app/Http/Requests/Update{Entidad}Request.php`

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class Update{Entidad}Request extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // TODO: agregar reglas específicas de la entidad
        ];
    }

    public function messages(): array
    {
        return [
            // 'campo.required' => 'El campo :attribute es obligatorio.',
        ];
    }
}
```

> ⚠️ **Reglas unique con ignore()**: Al usar `Rule::unique(...)->ignore($this->route(...))`, el nombre del parámetro de ruta lo determina Laravel con `Str::singular()` (inglés). Para entidades en español, esto puede ser inesperado:
> - `proveedores` → parámetro `{proveedore}` (no `{proveedor}`)
> - `clientes` → parámetro `{cliente}` (correcto, `cliente` es singular en inglés y español)
> - Usar `php artisan route:list --name={entidad_plural}.update` para verificar el nombre real.

### 4. Crear el Export

`app/Exports/{Entidad}Export.php`

```php
<?php

namespace App\Exports;

use App\Models\{Entidad};
use Illuminate\Http\Request;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class {Entidad}Export implements FromQuery, WithHeadings, WithMapping
{
    public function __construct(
        protected Request $request
    ) {}

    public function query()
    {
        return {Entidad}::query()->applyFilters($this->request);
    }

    public function headings(): array
    {
        return [
            // TODO: columnas del encabezado del Excel
        ];
    }

    public function map($row): array
    {
        return [
            // TODO: mapeo de cada campo a su valor
        ];
    }
}
```

### 5. Agregar rutas

En `routes/web.php`, dentro del middleware `auth`:

```php
// ⚠️ La ruta de exportación DEBE ir ANTES de Route::resource para que
// `GET {entidad_plural}/exportar` no sea interceptado por `GET {entidad_plural}/{entidad_singular}` (show)
Route::get('{entidad_plural}/exportar', [{Entidad}Controller::class, 'exportar'])->name('{entidad_plural}.exportar');
Route::resource('{entidad_plural}', {Entidad}Controller::class);
```

### 6. Páginas Frontend

#### Index.tsx

```tsx
import { Head, Link, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card } from '@/Components/ui/Card';
import { Pagination } from '@/Components/ui/Pagination';
import { TableHeader } from '@/Components/ui/TableHeader';
import { ConfirmDialog } from '@/Components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import HighlightText from '@/Components/ui/HighlightText';

const columnas = [
  // { key: 'nombre', label: 'Nombre' },
  // { key: 'email', label: 'Email', render: (item) => item.email ?? '—' },
  // { key: 'activo', label: 'Estado', render: (item) => item.activo ? '✅' : '❌' },
];

interface Filters {
  busqueda: string;
  orden: string;
  direccion: 'asc' | 'desc';
  por_pagina: number;
}

export default function Index({ {entidad_plural}, filtros }: { {entidad_plural}: any; filtros: Filters }) {
  const { flash } = usePage().props as any;
  const [search, setSearch] = useState<string>(filtros.busqueda ?? '');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const porPaginaDefault = window.innerWidth < 768 ? 5 : 10;

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  useEffect(() => {
    if (filtros.por_pagina === undefined) {
      const pp = window.innerWidth < 768 ? 5 : 10;
      if (pp !== 10) {
        router.get(route('{entidad_plural}.index', { ...filtros, por_pagina: pp, busqueda: search || undefined }), {}, { replace: true });
      }
    }
  }, []);

  const resultados = {entidad_plural}.total ?? 0;
  const filtrosActivos = search !== '';

  const aplicarFiltros = () => {
    router.get(route('{entidad_plural}.index'), {
      ...filtros,
      busqueda: search || undefined,
      page: 1,
    }, { preserveState: true, replace: true });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') aplicarFiltros();
  };

  const limpiarFiltros = () => {
    setSearch('');
    router.get(route('{entidad_plural}.index'), {}, { preserveState: true, replace: true });
  };

  const ordenar = (columna: string) => {
    router.get(route('{entidad_plural}.index'), {
      ...filtros,
      orden: columna,
      direccion: filtros.orden === columna && filtros.direccion === 'asc' ? 'desc' : 'asc',
      busqueda: search,
    }, { preserveState: true, replace: true });
  };

  const cambiarPagina = (params: Record<string, any>) => {
    router.get(route('{entidad_plural}.index'), { ...filtros, ...params, busqueda: search }, { preserveState: true, replace: true });
  };

  const confirmarEliminar = (id: number) => setDeleteId(id);

  const eliminar = () => {
    if (!deleteId) return;
    router.delete(route('{entidad_plural}.destroy', deleteId), {
      onSuccess: () => {
        setDeleteId(null);
      },
    });
  };

  return (
    <>
      <Head title="{Entidad}" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{Entidad}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {filtrosActivos
                ? `Se encontraron ${resultados} ${resultados === 1 ? 'coincidencia' : 'coincidencias'}`
                : `${resultados} ${resultados === 1 ? 'registro' : 'registros'} en total`
              }
            </p>
          </div>
          <Link href={route('{entidad_plural}.create', { return_url: window.location.href })} className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors">
            + Nuevo {__('{Entidad}')}
          </Link>
        </div>

        <Card>
          {/* Filtros */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <input
                type="text"
                placeholder="Buscar por nombre, apellido, documento, teléfono o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch('');
                    router.get(route('{entidad_plural}.index'), { ...filtros, busqueda: undefined }, { preserveState: true });
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
            <button onClick={aplicarFiltros} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-colors">
              Buscar
            </button>
            <button onClick={limpiarFiltros} className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              Limpiar
            </button>
            {/* ⚠️ Usar <button> + window.location.href (NO <Link>) para que Inertia no intercepte
                  la descarga del archivo Excel. <Link> haría XHR y el BinaryFileResponse no se procesaría. */}
            <button
              onClick={() => { window.location.href = route('{entidad_plural}.exportar', filtros); }}
              className="px-4 py-2 rounded-lg border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
            >
              Exportar Excel
            </button>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="border-b border-slate-200 dark:border-slate-700">
                <tr>
                  {columnas.map((col) => (
                    <TableHeader
                      key={col.key}
                      label={col.label}
                      sortKey={col.key}
                      currentSort={filtros.orden}
                      currentDir={filtros.direccion}
                      onSort={ordenar}
                    />
                  ))}
                  <th className="px-4 py-3 text-right text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap lg:whitespace-normal">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {entidad_plural}.data?.length === 0 ? (
                  <tr>
                    <td colSpan={columnas.length + 1} className="px-4 py-12 text-center text-slate-400">
                      No se encontraron registros.
                    </td>
                  </tr>
                ) : (
                  {entidad_plural}.data?.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      {columnas.map((col) => (
                        <td key={col.key} className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap lg:whitespace-normal">
                          {filtros.busqueda
                            ? <HighlightText text={col.render ? col.render(item) : String(item[col.key] ?? '')} query={filtros.busqueda} />
                            : (col.render ? col.render(item) : item[col.key])
                          }
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={route('{entidad_plural}.show', [item.id, { url_anterior: window.location.href }])} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Ver">
                            👁
                          </Link>
                          <Link href={route('{entidad_plural}.edit', item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Editar">
                            ✏️
                          </Link>
                          <button onClick={() => confirmarEliminar(item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Eliminar">
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            meta={{entidad_plural}.meta ?? {entidad_plural}}
            porPagina={filtros.por_pagina ?? porPaginaDefault}
            onChange={cambiarPagina}
          />
        </Card>
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={eliminar}
        title="Confirmar eliminación"
        message="¿Estás seguro de eliminar este registro? Esta acción no se puede deshacer."
      />
    </>
  );
}

Index.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
```

#### Form.tsx (compartido entre Create y Edit)

```tsx
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Link, useForm } from '@inertiajs/react';

interface Props {
  {entidad_singular}?: any; // solo en modo edición
  return_url?: string;
}

export default function Form({ {entidad_singular}, return_url }: Props) {
  const isEdit = !!{entidad_singular};

  const { data, setData, post, put, processing, errors } = useForm({
    // TODO: inicializar con valores de {entidad_singular} o vacío
    return_url: return_url ?? '',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    isEdit
      ? put(route('{entidad_plural}.update', {entidad_singular}.id))
      : post(route('{entidad_plural}.store'));
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* TODO: campos del formulario */}

      {/* Ejemplo de campo:
      <div>
        <InputLabel htmlFor="nombre" value="Nombre" />
        <span className="text-red-500 ml-1">*</span>
        <TextInput
          id="nombre"
          type="text"
          value={data.nombre ?? ''}
          onChange={(e) => setData('nombre', e.target.value)}
          className="mt-1.5 block w-full"
        />
        <InputError message={errors.nombre} className="mt-2" />
      </div>
      */}

      <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <PrimaryButton disabled={processing}>
          {processing ? 'Guardando...' : 'Guardar'}
        </PrimaryButton>
        <Link
          href={route('{entidad_plural}.index')}
          className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
```

#### Create.tsx

```tsx
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card } from '@/Components/ui/Card';
import Form from './Form';

export default function Create({ return_url }: { return_url?: string }) {
  return (
    <>
      <Head title="Crear {Entidad}" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Crear {Entidad}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Completa los campos para registrar un nuevo {__('{entidad_singular}')}.
          </p>
        </div>
        <Card>
          <Form return_url={return_url} />
        </Card>
      </div>
    </>
  );
}

Create.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
```

#### Edit.tsx

```tsx
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card } from '@/Components/ui/Card';
import Form from './Form';

export default function Edit({ {entidad_singular}, return_url }: { {entidad_singular}: any; return_url?: string }) {
  return (
    <>
      <Head title={`Editar ${__('{entidad_singular}')}`} />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Editar {Entidad}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Modifica los campos necesarios.
          </p>
        </div>
        <Card>
          <Form {entidad_singular}={entidad_singular} return_url={return_url} />
        </Card>
      </div>
    </>
  );
}

Edit.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
```

#### Show.tsx

La vista Show muestra los datos del registro en campos de solo lectura con apariencia de formulario. Cada campo se renderiza como un `<input>` o `<textarea>` con `readOnly`, usando el mismo diseño que el formulario de crear/editar.

```tsx
import { Head, Link, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card } from '@/Components/ui/Card';
import { ConfirmDialog } from '@/Components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';

export default function Show({ {entidad_singular}, url_anterior }: { {entidad_singular}: any; url_anterior?: string }) {
  const { flash } = usePage().props as any;
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  const eliminar = () => {
    router.delete(route('{entidad_plural}.destroy', {entidad_singular}.id), {
      onSuccess: () => setShowDelete(false),
    });
  };

  // Definir los campos a mostrar. type: 'text' para input, 'textarea' para textarea (ocupa 2 columnas)
  const fields = [
    // { label: 'Nombre', value: {entidad_singular}.nombre, type: 'text' },
    // { label: 'Dirección', value: {entidad_singular}.direccion ?? '—', type: 'textarea' },
  ];

  return (
    <>
      <Head title={`Detalle de ${__('{entidad_singular}')}`} />
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {/* TODO: mostrar nombre o identificador del registro */}
              {__('{Entidad}')} #{__('{entidad_singular}').id}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {/* TODO: subtítulo informativo */}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={route('{entidad_plural}.create', { return_url: url_anterior ?? undefined })}
              className="shrink-0 px-3 py-1.5 md:px-4 md:py-2 rounded-lg bg-emerald-600 text-white text-xs md:text-sm hover:bg-emerald-700 transition-colors"
            >
              + Nuevo {__('{Entidad}')}
            </Link>
            <Link
              href={url_anterior ?? route('{entidad_plural}.index')}
              className="shrink-0 px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-xs md:text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Aceptar
            </Link>
            <Link
              href={route('{entidad_plural}.edit', [{entidad_singular}.id, { return_url: url_anterior ?? undefined }])}
              className="shrink-0 px-3 py-1.5 md:px-4 md:py-2 rounded-lg bg-indigo-600 text-white text-xs md:text-sm hover:bg-indigo-700 transition-colors"
            >
              Editar
            </Link>
            <button
              onClick={() => setShowDelete(true)}
              className="shrink-0 px-3 py-1.5 md:px-4 md:py-2 rounded-lg bg-red-600 text-white text-xs md:text-sm hover:bg-red-700 transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>

        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {fields.map((f) => (
              <div key={f.label} className={f.type === 'textarea' ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  {f.label}
                </label>
                {f.type === 'textarea' ? (
                  <textarea
                    readOnly
                    rows={3}
                    value={f.value}
                    className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 px-3 py-2 text-sm cursor-default"
                  />
                ) : (
                  <input
                    type="text"
                    readOnly
                    value={f.value}
                    className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 px-3 py-2 text-sm cursor-default"
                  />
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={eliminar}
        title="Confirmar eliminación"
        message="¿Estás seguro de eliminar este registro? Esta acción no se puede deshacer."
      />
    </>
  );
}

Show.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
```

## Componentes Compartidos

### app/Traits/HasFiltros.php (crear una sola vez)

```php
<?php

declare(strict_types=1);

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

trait HasFiltros
{
    public function scopeApplyFilters(Builder $query, Request $request): Builder
    {
        $busqueda = $request->input('busqueda');

        if ($busqueda) {
            $columnas = method_exists($this, 'getSearchColumns')
                ? $this->getSearchColumns()
                : ['nombre'];

            $query->where(function (Builder $q) use ($busqueda, $columnas) {
                foreach ($columnas as $columna) {
                    $q->orWhere($columna, 'like', "%{$busqueda}%");
                }
            });
        }

        return $query;
    }

    public function scopeApplySorting(Builder $query, Request $request): Builder
    {
        $orden = $request->input('orden');
        $direccion = $request->input('direccion', 'asc');

        if ($orden && in_array($direccion, ['asc', 'desc'])) {
            $query->orderBy($orden, $direccion);
        } else {
            $query->latest();
        }

        return $query;
    }
}
```

> **Nota**: La búsqueda usa OR entre columnas. Define las columnas a buscar agregando `getSearchColumns()` al modelo:
> ```php
> public function getSearchColumns(): array
> {
>     return ['nombre', 'apellido', 'email', ...];
> }
> ```
> Si el método no existe, busca solo por `nombre`.

### resources/js/Components/ui/TableHeader.tsx

```tsx
interface Props {
  label: string;
  sortKey: string;
  currentSort?: string;
  currentDir?: 'asc' | 'desc';
  onSort: (key: string) => void;
}

export function TableHeader({ label, sortKey, currentSort, currentDir, onSort }: Props) {
  const isActive = currentSort === sortKey;

  return (
    <th
      className="px-4 py-3 text-left text-slate-500 dark:text-slate-400 font-medium cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-300 transition-colors whitespace-nowrap lg:whitespace-normal"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        <span className="text-xs">
          {isActive ? (currentDir === 'asc' ? '↑' : '↓') : '↕'}
        </span>
      </div>
    </th>
  );
}
```

### resources/js/Components/ui/Pagination.tsx

```tsx
import { Link } from '@inertiajs/react';

interface Props {
  meta: {
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
  };
  porPagina: number;
  onChange: (params: Record<string, any>) => void;
}

const opciones = [5, 10, 15, 50, 100];

export function Pagination({ meta, porPagina, onChange }: Props) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <span>Registros por página:</span>
        <select
          value={porPagina}
          onChange={(e) => onChange({ por_pagina: Number(e.target.value), page: 1 })}
          className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {opciones.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <span>
          Mostrando {meta.from}–{meta.to} de {meta.total} registros
        </span>
      </div>

      <div className="flex items-center gap-1">
        {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onChange({ page })}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              page === meta.current_page
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### resources/js/Components/ui/ConfirmDialog.tsx

```tsx
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message }: Props) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
            leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md rounded-xl bg-white dark:bg-slate-800 p-6 shadow-xl border border-slate-200 dark:border-slate-700">
              <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {title}
              </Dialog.Title>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{message}</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={onConfirm}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
                >
                  Sí, eliminar
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
```

### resources/js/Components/ui/HighlightText.tsx

Resalta coincidencias de búsqueda en texto plano. Se usa en las tablas para marcar visualmente el texto que coincide con la búsqueda.

```tsx
export default function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const partes = text.split(regex);

  return (
    <>
      {partes.map((parte, i) =>
        regex.test(parte)
          ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-700 rounded px-0.5">{parte}</mark>
          : parte
      )}
    </>
  );
}
```

## Instalación de dependencias

```bash
composer require maatwebsite/laravel-excel
npm install react-hot-toast
```

### Configurar Toaster

En `resources/js/app.tsx`, agregar el componente `<Toaster />` para que las notificaciones toast se rendericen:

```tsx
import { Toaster } from 'react-hot-toast';

// En setup():
root.render(
  <>
    <Toaster position="top-right" toastOptions={{
      duration: 4000,
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    }} />
    <App {...props} />
  </>
);
```

## Variables placeholder

Usar estos placeholders al generar el CRUD para una entidad específica:

| Placeholder | Ejemplo (Clientes) | Ejemplo (Productos) |
|---|---|---|
| `{Entidad}` | `Cliente` | `Producto` |
| `{entidad_singular}` | `cliente` | `producto` |
| `{entidad_plural}` | `clientes` | `productos` |

> ⚠️ **Singularización en español**: Laravel usa el pluralizador inglés (`Str::singular()`) para generar nombres de parámetros de ruta. Con `Route::resource('proveedores', ...)` el parámetro será `{proveedore}` (no `{proveedor}`). Esto afecta al `ignore()` en `Update{Entidad}Request`:
> ```php
> // ❌ Incorrecto para 'proveedores':
> Rule::unique('proveedores', 'nit_ci')->ignore($this->route('proveedor')); // NULL
>
> // ✅ Correcto:
> Rule::unique('proveedores', 'nit_ci')->ignore($this->route('proveedore'));
> ```
> Verificar siempre el nombre real del parámetro con `php artisan route:list --name={entidad_plural}.update`.

## Vista Show — preservar paginación

Para que el botón "Aceptar" en Show vuelva al Index respetando la página actual, pasar la URL anterior desde el controlador:

```php
// En el controlador
return inertia('{Entidad}/Show', [
    '{entidad_singular}' => $this->service->obtenerPorId($id),
    'url_anterior' => url()->previous(),
]);
```

En Show.tsx:
```tsx
const { url_anterior } = usePage().props as any;
// ...
<Link href={url_anterior} ...>Aceptar</Link>
```

### ⚠️ Evitar anidamiento de `url_anterior` en botones "Editar" y "+ Nuevo"

Los botones "Editar" y "+ Nuevo" en Show.tsx **deben usar `url_anterior` como `return_url`**, NO `window.location.href`. Usar `window.location.href` causa que el parámetro `url_anterior` se anide cada ciclo Show → Edit → Show:

```
# ❌ Incorrecto — se anida:
Show (url_anterior=/productos)
  → Editar con return_url = window.location.href = "http://.../productos/1?url_anterior=/productos"
  → Edit controller usa ese return_url como nuevo url_anterior
  → Show (url_anterior = "http://.../productos/1?url_anterior=/productos")
  → Al hacer "Aceptar", vuelve a Show (no a Index)
  → Cada ciclo anida una capa más

# ✅ Correcto — no se anida:
Show (url_anterior=/productos)
  → Editar con return_url = url_anterior = "/productos"
  → Edit controller usa "/productos" como nuevo url_anterior
  → Show (url_anterior = "/productos")
  → Al hacer "Aceptar", vuelve a Index ✓
```

```tsx
// ✅ Correcto — usar url_anterior como return_url
<Link href={route('{entidad_plural}.edit', [{entidad_singular}.id, { return_url: url_anterior ?? undefined }])}>
  Editar
</Link>
<Link href={route('{entidad_plural}.create', { return_url: url_anterior ?? undefined })}>
  + Nuevo {__('{Entidad}')}
</Link>

// ❌ Incorrecto — causa anidamiento progresivo
<Link href={route('{entidad_plural}.edit', [{entidad_singular}.id, { return_url: window.location.href }])}>
  Editar
</Link>
```

Usar `url_anterior ?? undefined` en lugar de `url_anterior || window.location.href`:
- Si `url_anterior` existe (flujo normal), se usa como `return_url` → el ciclo mantiene el destino original
- Si `url_anterior` es `undefined` (navegación directa a Show), se omite el query param y el servidor usa `url()->previous()` como fallback

### Preservar paginación al ir de Index a Show

El botón "Ver" (👁) en Index.tsx **debe pasar `url_anterior: window.location.href`** para que el Show page conozca la URL exacta del Index con paginación y filtros activos:

```tsx
// ✅ Correcto — pasa la URL actual del Index (incluye ?page=2, ?busqueda=..., etc.)
<Link href={route('{entidad_plural}.show', [item.id, { url_anterior: window.location.href }])}>
  👁
</Link>

// ❌ Incorrecto — el controlador usa url()->previous(), que en Inertia NO refleja
//     navegación cliente (History API), solo el Referer HTTP de la última carga completa.
<Link href={route('{entidad_plural}.show', item.id)}>
  👁
</Link>
```

**Por qué:** Inertia navega con History API (pushState/replaceState), no con carga completa de página. El `url()->previous()` de Laravel lee el header HTTP `Referer`, que NO se actualiza en navegaciones Inertia. Sin `url_anterior` explícito, el Show page puede recibir una URL incorrecta en `url_anterior` y "Volver" no regresará al Index con la paginación correcta.
