# Choppín — Sales Application Stack

---

## Tecnologías

| Capa | Tecnología |
|---|---|
| Backend | Laravel 13 |
| Frontend | React + TypeScript (estricto) + Inertia.js |
| Estilos | Tailwind CSS |
| Base de Datos | MySQL |
| Autenticación | Laravel Sanctum |
| Roles/Permisos | Spatie Laravel Permissions |
| Herramientas Dev | Laravel Pint, Laravel IDE Helper |

---

## Estructura del Proyecto

```
D:\progra\choppin\
├── app/
│   ├── Enums/
│   │   ├── EstadoVenta.php              # completado, anulado
│   │   ├── EstadoOrdenCompra.php        # pendiente, recibido, anulado
│   │   ├── TipoMovimientoStock.php      # ingreso_compra, ingreso_manual, egreso_venta, egreso_manual, ajuste
│   │   ├── TipoComprobante.php          # boleta, factura
│   │   └── TipoPago.php                 # efectivo, tarjeta, transferencia
│   ├── Models/
│   │   ├── User.php
│   │   ├── Cliente.php
│   │   ├── Empleado.php
│   │   ├── Proveedor.php
│   │   ├── CategoriaProducto.php
│   │   ├── Producto.php
│   │   ├── PrecioProducto.php
│   │   ├── OrdenCompra.php
│   │   ├── DetalleOrdenCompra.php
│   │   ├── MovimientoStock.php
│   │   ├── Venta.php
│   │   └── DetalleVenta.php
│   ├── Traits/
│   │   ├── HasCreadorActualizador.php   # asigna created_by / updated_by automáticamente
│   │   └── HasEliminador.php            # asigna deleted_by en softDeletes
│   ├── Services/
│   │   ├── StockService.php             # procesa ingresos/egresos/ajustes de stock
│   │   ├── VentaService.php             # registrar venta + descontar stock
│   │   ├── OrdenCompraService.php       # procesar recepción de orden de compra
│   │   └── PrecioService.php            # obtener precio vigente de un producto
│   ├── Http/
│   │   ├── Controllers/Api/V1/
│   │   ├── Requests/
│   │   └── Resources/
│   └── Policies/
│       ├── VentaPolicy.php
│       ├── ProductoPolicy.php
│       ├── ClientePolicy.php
│       └── ...
├── database/
│   ├── migrations/
│   ├── factories/
│   └── seeders/
│       ├── DatabaseSeeder.php
│       ├── RolePermissionSeeder.php
│       ├── UserSeeder.php
│       ├── ClienteSeeder.php
│       ├── ProductoSeeder.php
│       └── VentaSeeder.php
├── resources/js/
│   ├── Components/
│   │   ├── ui/                      # primitives (botones, inputs, selects, modales)
│   │   ├── Can.tsx                  # componente condicional por permiso
│   │   ├── DataTable.tsx
│   │   └── PermissionGuard.tsx
│   ├── Layouts/
│   │   ├── AuthLayout.tsx
│   │   ├── DashboardLayout.tsx      # sidebar + topbar
│   │   └── AppLayout.tsx
│   ├── Pages/
│   │   ├── Auth/
│   │   ├── Dashboard/
│   │   ├── Clientes/
│   │   ├── Productos/
│   │   ├── Ventas/
│   │   ├── Compras/
│   │   ├── Proveedores/
│   │   ├── Almacen/
│   │   ├── Empleados/
│   │   ├── Reportes/
│   │   └── Admin/
│   │       ├── Usuarios/
│   │       └── Roles/
│   ├── types/
│   │   ├── models.ts                # interfaces de todas las entidades
│   │   ├── enums.ts                 # enums compartidos
│   │   └── api.ts                   # tipos de respuesta API
│   ├── hooks/
│   │   ├── usePermission.ts
│   │   ├── useAuth.ts
│   │   └── useMock.ts               # hook para alternar mock/real
│   ├── services/
│   │   ├── api/                     # clientes HTTP reales
│   │   └── mock/                    # datos mock para desarrollo
│   │       ├── dashboardMock.ts
│   │       ├── ventasMock.ts
│   │       ├── productosMock.ts
│   │       ├── clientesMock.ts
│   │       └── usersMock.ts
│   └── utils/
├── routes/
│   ├── api.php                      # Sanctum auth + API endpoints
│   └── web.php                      # Inertia pages
└── config/
    ├── permission.php               # lista centralizada de permisos
    └── audit.php                    # config de auditoría (si se usa paquete)
```

---

## Base de Datos — Esquema Completo

### Tabla: `users`

| Columna | Tipo | Restricciones |
|---|---|---|
| id | bigIncrements | PK |
| name | string(255) | NOT NULL |
| email | string(255) | UNIQUE, NOT NULL |
| password | string(255) | NOT NULL |
| activo | boolean | default true |
| ultimo_acceso | datetime | nullable |
| created_by | foreignId -> users | nullable |
| updated_by | foreignId -> users | nullable |
| deleted_by | foreignId -> users | nullable |
| timestamps | — | — |
| softDeletes | — | — |

### Tabla: `clientes`

| Columna | Tipo | Restricciones |
|---|---|---|
| id | bigIncrements | PK |
| nombre | string(255) | NOT NULL |
| apellido | string(255) | NOT NULL |
| tipo_documento | enum: dni, ce, ruc | NOT NULL |
| numero_documento | string(20) | UNIQUE, NOT NULL |
| telefono | string(20) | nullable |
| email | string(255) | nullable |
| direccion | text | nullable |
| created_by | foreignId -> users | nullable |
| updated_by | foreignId -> users | nullable |
| deleted_by | foreignId -> users | nullable |
| timestamps | — | — |
| softDeletes | — | — |

### Tabla: `empleados`

| Columna | Tipo | Restricciones |
|---|---|---|
| id | bigIncrements | PK |
| user_id | foreignId -> users | nullable, UNIQUE |
| nombre | string(255) | NOT NULL |
| apellido | string(255) | NOT NULL |
| tipo_documento | enum: dni, ce | NOT NULL |
| numero_documento | string(20) | UNIQUE, NOT NULL |
| telefono | string(20) | nullable |
| email | string(255) | nullable |
| cargo | string(255) | nullable |
| fecha_contratacion | date | NOT NULL |
| activo | boolean | default true |
| created_by | foreignId -> users | nullable |
| updated_by | foreignId -> users | nullable |
| deleted_by | foreignId -> users | nullable |
| timestamps | — | — |
| softDeletes | — | — |

### Tabla: `proveedores`

| Columna | Tipo | Restricciones |
|---|---|---|
| id | bigIncrements | PK |
| nombre | string(255) | NOT NULL |
| contacto | string(255) | nullable |
| telefono | string(20) | nullable |
| email | string(255) | nullable |
| direccion | text | nullable |
| ruc | string(11) | UNIQUE, nullable |
| activo | boolean | default true |
| created_by | foreignId -> users | nullable |
| updated_by | foreignId -> users | nullable |
| deleted_by | foreignId -> users | nullable |
| timestamps | — | — |
| softDeletes | — | — |

### Tabla: `categoria_productos`

| Columna | Tipo | Restricciones |
|---|---|---|
| id | bigIncrements | PK |
| nombre | string(255) | UNIQUE, NOT NULL |
| descripcion | text | nullable |
| activo | boolean | default true |
| created_by | foreignId -> users | nullable |
| updated_by | foreignId -> users | nullable |
| deleted_by | foreignId -> users | nullable |
| timestamps | — | — |
| softDeletes | — | — |

### Tabla: `productos`

| Columna | Tipo | Restricciones |
|---|---|---|
| id | bigIncrements | PK |
| categoria_id | foreignId -> categoria_productos | NOT NULL |
| codigo | string(50) | UNIQUE, NOT NULL |
| nombre | string(255) | NOT NULL |
| descripcion | text | nullable |
| imagen | string(255) | nullable |
| stock_actual | decimal(10,2) | default 0 |
| stock_minimo | decimal(10,2) | default 0 |
| unidad_medida | string(50) | default 'unidad' |
| activo | boolean | default true |
| created_by | foreignId -> users | nullable |
| updated_by | foreignId -> users | nullable |
| deleted_by | foreignId -> users | nullable |
| timestamps | — | — |
| softDeletes | — | — |

### Tabla: `precio_productos`

| Columna | Tipo | Restricciones |
|---|---|---|
| id | bigIncrements | PK |
| producto_id | foreignId -> productos | NOT NULL |
| precio_compra | decimal(10,2) | NOT NULL |
| precio_venta | decimal(10,2) | NOT NULL |
| fecha_inicio | date | NOT NULL |
| fecha_fin | date | nullable |
| created_by | foreignId -> users | nullable |
| updated_by | foreignId -> users | nullable |
| timestamps | — | — |

> **Regla de negocio:** solo un precio activo por producto en cualquier fecha.
> Se valida que no exista solapamiento de rangos (fecha_inicio - fecha_fin).

### Tabla: `ordenes_compra`

| Columna | Tipo | Restricciones |
|---|---|---|
| id | bigIncrements | PK |
| proveedor_id | foreignId -> proveedores | NOT NULL |
| user_id | foreignId -> users | NOT NULL |
| numero_comprobante | string(50) | NOT NULL |
| tipo_comprobante | enum: boleta, factura | NOT NULL |
| fecha_emision | datetime | NOT NULL |
| moneda | enum: PEN, USD | default 'PEN' |
| tipo_cambio | decimal(10,4) | default 1 |
| subtotal | decimal(10,2) | NOT NULL |
| igv | decimal(10,2) | NOT NULL |
| total | decimal(10,2) | NOT NULL |
| observaciones | text | nullable |
| estado | enum: pendiente, recibido, anulado | default 'pendiente' |
| created_by | foreignId -> users | nullable |
| updated_by | foreignId -> users | nullable |
| deleted_by | foreignId -> users | nullable |
| timestamps | — | — |
| softDeletes | — | — |

### Tabla: `detalle_orden_compra`

| Columna | Tipo | Restricciones |
|---|---|---|
| id | bigIncrements | PK |
| orden_compra_id | foreignId -> ordenes_compra | NOT NULL |
| producto_id | foreignId -> productos | NOT NULL |
| cantidad | decimal(10,2) | NOT NULL |
| precio_unitario | decimal(10,2) | NOT NULL |
| subtotal | decimal(10,2) | NOT NULL |
| created_by | foreignId -> users | nullable |
| updated_by | foreignId -> users | nullable |
| timestamps | — | — |

### Tabla: `ventas`

| Columna | Tipo | Restricciones |
|---|---|---|
| id | bigIncrements | PK |
| user_id | foreignId -> users | NOT NULL |
| cliente_id | foreignId -> clientes | nullable |
| numero_comprobante | string(50) | NOT NULL |
| tipo_comprobante | enum: boleta, factura | NOT NULL |
| fecha_emision | datetime | NOT NULL |
| moneda | enum: PEN, USD | default 'PEN' |
| tipo_cambio | decimal(10,4) | default 1 |
| subtotal | decimal(10,2) | NOT NULL |
| igv | decimal(10,2) | NOT NULL |
| descuento | decimal(10,2) | default 0 |
| total | decimal(10,2) | NOT NULL |
| tipo_pago | enum: efectivo, tarjeta, transferencia | NOT NULL |
| observaciones | text | nullable |
| estado | enum: completado, anulado | default 'completado' |
| created_by | foreignId -> users | nullable |
| updated_by | foreignId -> users | nullable |
| deleted_by | foreignId -> users | nullable |
| timestamps | — | — |
| softDeletes | — | — |

### Tabla: `detalle_ventas`

| Columna | Tipo | Restricciones |
|---|---|---|
| id | bigIncrements | PK |
| venta_id | foreignId -> ventas | NOT NULL |
| producto_id | foreignId -> productos | NOT NULL |
| cantidad | decimal(10,2) | NOT NULL |
| precio_unitario | decimal(10,2) | NOT NULL |
| descuento | decimal(10,2) | default 0 |
| subtotal | decimal(10,2) | NOT NULL |
| created_by | foreignId -> users | nullable |
| updated_by | foreignId -> users | nullable |
| timestamps | — | — |

### Tabla: `movimientos_stock`

| Columna | Tipo | Restricciones |
|---|---|---|
| id | bigIncrements | PK |
| producto_id | foreignId -> productos | NOT NULL |
| user_id | foreignId -> users | NOT NULL |
| tipo | enum: ingreso_compra, ingreso_manual, egreso_venta, egreso_manual, ajuste | NOT NULL |
| cantidad | decimal(10,2) | NOT NULL |
| stock_anterior | decimal(10,2) | NOT NULL |
| stock_posterior | decimal(10,2) | NOT NULL |
| referencia_type | string(255) | nullable (polymorphic) |
| referencia_id | bigInteger | nullable (polymorphic) |
| motivo | text | nullable |
| created_by | foreignId -> users | nullable |
| updated_by | foreignId -> users | nullable |
| timestamps | — | — |

> **Regla:** los movimientos de stock son **inmutables** — no tienen softDeletes ni se editan.
> `cantidad` siempre es positiva. El signo se determina por `tipo`.

---

## Trazabilidad

### Trait: `HasCreadorActualizador`

Se aplica a todos los modelos. Asigna automáticamente `created_by` y `updated_by` desde `auth()->id()` en los eventos `creating` / `updating`.

### Trait: `HasEliminador`

Se aplica a modelos con softDeletes. Asigna `deleted_by` en el evento `deleting`.

### Tabla de Auditoría (polimórfica) — opcional

Para trazabilidad histórica fina sobre cambios en campos críticos (precios, estados, stock), se puede usar:

```
audits
├── id
├── user_id (FK -> users)
├── event (created / updated / deleted / restored)
├── auditable_type + auditable_id (polymorphic)
├── old_values (json)
├── new_values (json)
└── created_at
```

---

## Roles y Permisos

### Paquete: `spatie/laravel-permission`

### Permisos disponibles (10 módulos × 5 acciones = 50 permisos)

| Módulo | Slug | ver | crear | modificar | eliminar | exportar |
|---|---|---|---|---|---|---|
| Ventas | ventas | ✅ | ✅ | ✅ | ✅ | ✅ |
| Clientes | clientes | ✅ | ✅ | ✅ | ✅ | ✅ |
| Productos | productos | ✅ | ✅ | ✅ | ✅ | ✅ |
| Proveedores | proveedores | ✅ | ✅ | ✅ | ✅ | ✅ |
| Compras | compras | ✅ | ✅ | ✅ | ✅ | ✅ |
| Empleados | empleados | ✅ | ✅ | ✅ | ✅ | ✅ |
| Almacén | almacen | ✅ | ✅ | ✅ | ✅ | ✅ |
| Reportes | reportes | ✅ | — | — | — | ✅ |
| Usuarios | usuarios | ✅ | ✅ | ✅ | ✅ | ✅ |
| Configuración | configuracion | ✅ | ✅ | ✅ | ✅ | ✅ |

### Convención de naming

```
{modulo}.{accion}
```

Ejemplos: `ventas.ver`, `productos.crear`, `clientes.eliminar`, `reportes.exportar`

### Roles por defecto (editables desde panel Admin)

| Rol | Descripción | Asignado a |
|---|---|---|
| Administrador | Todos los permisos | Dueño / Dev |
| Vendedor | ventas.*, clientes.*, productos.ver, almacen.ver | Vendedores de tienda |
| Almacenero | productos.*, almacen.*, compras.* | Encargado de almacén |
| Supervisor | Igual que vendedor + reportes.*, empleados.ver | Jefe de tienda |

### Panel de Administración (UI)

- **/admin/usuarios** — CRUD de usuarios + asignación de roles
- **/admin/roles** — CRUD de roles con checkboxes de permisos agrupados por módulo

---

## Reglas de Negocio Clave

1. **Stock** — Solo se modifica a través de `StockService`. No se permite SQL directo.
2. **Precios** — Cada producto tiene exactamente un precio activo en cualquier fecha (validación de solapamiento).
3. **Ventas** — Al completar una venta, se descuenta stock automáticamente. Si stock < cantidad, la venta se rechaza.
4. **Ordenes de Compra** — Al cambiar estado a "recibido", se incrementa stock mediante `StockService` con tipo `ingreso_compra`.
5. **Anulaciones** — Anular una venta revierte el stock. Anular una orden de compra no lo revierte (debe hacerse ajuste manual).
6. **Auditoría** — Todo movimiento de stock es inmutable. No se edita ni elimina.

---

## Dashboard de Prueba (Mock Data)

### Estructura mock

Cada archivo exporta funciones que devuelven arrays de objetos tipados:

```typescript
// services/mock/ventasMock.ts
export function getVentasRecientes(): Venta[] { ... }
export function getResumenDashboard(): DashboardResumen { ... }
```

### Layout del Dashboard

```
┌─────────────────────────────────────────────────┐
│ Topbar: Logo | Búsqueda | Notificaciones | User │
├──────────┬──────────────────────────────────────┤
│ Sidebar  │   Dashboard Content                  │
│          │                                      │
│ Dashboard│   ┌─────┐┌─────┐┌─────┐┌─────┐      │
│ Ventas   │   │ KPI ││ KPI ││ KPI ││ KPI │      │
│ Productos│   └─────┘└─────┘└─────┘└─────┘      │
│ Clientes │                                      │
│ Proveed. │   ┌─────────────────────────────┐    │
│ Compras  │   │   Gráfico de Ingresos       │    │
│ Almacén  │   │   (Recharts)               │    │
│ Reportes │   └─────────────────────────────┘    │
│ Admin    │                                      │
│          │   ┌─────────────────────────────┐    │
│          │   │   Últimas Ventas (Tabla)    │    │
│          │   └─────────────────────────────┘    │
│          │                                      │
│          │   ┌─────────────────────────────┐    │
│          │   │   Alertas Stock Bajo        │    │
│          │   └─────────────────────────────┘    │
└──────────┴──────────────────────────────────────┘
```

### Tema visual

- **Paleta:** Slate + Indigo (acento)
- **Sidebar:** dark (slate-900), colapsable
- **Cards:** superficie blanca con sombra suave
- **Tablas:** diseño limpio con estados con badges de color
- **Gráficos:** Recharts con tema consistente

---

## Plan de Implementación

### Fase 1 — Proyecto Base
- [ ] `laravel new choppin --react --typescript --pest`
- [ ] Configurar `.env` (MySQL, APP_URL)
- [ ] Instalar dependencias: `spatie/laravel-permission`, `laravel-ide-helper`
- [ ] Configurar Laravel Pint (`pint.json`)
- [ ] Publicar config de permission

### Fase 2 — Base de Datos
- [ ] Migraciones de todas las tablas (orden correcto: categorías → productos → precios → proveedores → ordenes → movimientos → clientes → ventas)
- [ ] Enumeraciones PHP (spatie/enum o native backed enums)
- [ ] Traits: `HasCreadorActualizador`, `HasEliminador`
- [ ] Modelos con relaciones, casts, traits
- [ ] Factories para todas las entidades
- [ ] Seeders con datos de prueba

### Fase 3 — Servicios
- [ ] `PrecioService` (precio vigente por fecha)
- [ ] `StockService` (registrar movimiento + actualizar stock_actual)
- [ ] `VentaService` (crear venta + detalle + descontar stock)
- [ ] `OrdenCompraService` (recibir orden + incrementar stock)

### Fase 4 — Autenticación y Permisos
- [ ] Sanctum setup (middleware, routes)
- [ ] `RolePermissionSeeder` con permisos y roles por defecto
- [ ] Policies por modelo
- [ ] Middleware para verificar permisos vía Spatie

### Fase 5 — API (Endpoints)
- [ ] Resource Controllers (`api.php`)
- [ ] Form Requests con validación
- [ ] API Resources para transformar respuestas
- [ ] Filtros, ordenamiento, paginación

### Fase 6 — Frontend Mock Dashboard
- [ ] Configurar Vite + Inertia + React + TypeScript + Tailwind
- [ ] Tipos estrictos de TypeScript (models, enums, api)
- [ ] Layout Dashboard (sidebar + topbar) con navegación
- [ ] Datos mock en `services/mock/`
- [ ] Componentes UI básicos (DataTable, Badge, Card, Modal)
- [ ] Páginas Dashboard: KPIs, gráficos, tabla ventas, alertas stock
- [ ] Hook `usePermission` + componente `<Can>`
- [ ] Mock de login (sin auth real)

### Fase 7 — Conexión Frontend + Backend
- [ ] Reemplazar servicios mock por llamadas API reales
- [ ] Estado global de usuario y permisos
- [ ] Protección de rutas por rol/permiso

### Fase 8 — Módulos CRUD
- [ ] Productos (con selector de categoría, precio activo, stock)
- [ ] Clientes
- [ ] Proveedores
- [ ] Categorías
- [ ] Empleados (vinculados a user)
- [ ] Usuarios + asignación de roles
- [ ] Roles + permisos (panel admin)

### Fase 9 — Módulo Ventas
- [ ] Carrito de compras con búsqueda de productos
- [ ] Calculadora de totales + IGV
- [ ] Selección de cliente (opcional)
- [ ] Tipo de pago
- [ ] Generación de comprobante
- [ ] Ticket de venta (vista previa)

### Fase 10 — Módulo Compras
- [ ] Orden de compra con detalle
- [ ] Recepción de orden (ingreso a stock)
- [ ] Ajuste manual de stock

### Fase 11 — Reportes
- [ ] Reporte de ventas por período
- [ ] Reporte de productos más vendidos
- [ ] Reporte de stock bajo / sin stock
- [ ] Exportación a Excel / PDF (Laravel Excel + DomPDF)

---

## Convenciones de Código

### PHP (Laravel Pint — PSR-12)
- `camelCase` para métodos y variables
- `snake_case` para columnas de BD
- Tipado estricto en todos los archivos (`declare(strict_types=1)`)
- PHPDoc en Services y Traits (omitir en Models simples)

### TypeScript
- `strict: true` en tsconfig
- `PascalCase` para interfaces y types
- `camelCase` para variables y funciones
- Prefijo `I` opcional en interfaces (consistencia en el proyecto)
- Tipos compartidos en `types/`, no duplicados

### Base de Datos
- Nombres de tablas en plural y snake_case
- FK: `{tabla}_id`
- Índices en columnas de búsqueda frecuente (documento, fechas, estados)
- Charset: `utf8mb4` / `utf8mb4_unicode_ci`

---

## Testing

| Tipo | Herramienta | Objetivo |
|---|---|---|
| Unit | Pest | Models, Services, Traits |
| Feature | Pest | API endpoints, Policies |
| Frontend | Vitest + React Testing Library | Componentes, hooks |
| E2E (futuro) | Playwright o Laravel Dusk | Flujos completos |

---

*Última actualización: 2026-05-28*
