import type { Producto, CategoriaProducto } from '@/types/models';

export function getCategorias(): CategoriaProducto[] {
  return [
    { id: 1, nombre: 'Abarrotes', descripcion: 'Productos de despensa', activo: true },
    { id: 2, nombre: 'Lácteos', descripcion: 'Productos derivados de la leche', activo: true },
    { id: 3, nombre: 'Bebidas', descripcion: 'Gaseosas, jugos y aguas', activo: true },
    { id: 4, nombre: 'Limpieza', descripcion: 'Productos de limpieza del hogar', activo: true },
    { id: 5, nombre: 'Snacks', descripcion: 'Botanas y dulces', activo: true },
  ];
}

export function getProductos(): Producto[] {
  return [
    { id: 1, categoria_id: 1, codigo: 'PRO-001', nombre: 'Arroz Costeño 1kg', descripcion: 'Arroz extra superior', imagen: null, stock_actual: 120, stock_minimo: 10, unidad_medida: 'kg', activo: true, precio_venta: 3.50 },
    { id: 2, categoria_id: 1, codigo: 'PRO-002', nombre: 'Aceite Primor 1L', descripcion: 'Aceite vegetal', imagen: null, stock_actual: 45, stock_minimo: 15, unidad_medida: 'litro', activo: true, precio_venta: 8.90 },
    { id: 3, categoria_id: 1, codigo: 'PRO-003', nombre: 'Azúcar Blanca 1kg', descripcion: 'Azúcar refinada', imagen: null, stock_actual: 0, stock_minimo: 20, unidad_medida: 'kg', activo: true, precio_venta: 4.20 },
    { id: 4, categoria_id: 2, codigo: 'PRO-004', nombre: 'Leche Gloria 1L', descripcion: 'Leche evaporada entera', imagen: null, stock_actual: 60, stock_minimo: 25, unidad_medida: 'litro', activo: true, precio_venta: 5.50 },
    { id: 5, categoria_id: 2, codigo: 'PRO-005', nombre: 'Queso Fresco 500g', descripcion: 'Queso fresco pasteurizado', imagen: null, stock_actual: 3, stock_minimo: 10, unidad_medida: 'unidad', activo: true, precio_venta: 12.00 },
    { id: 6, categoria_id: 3, codigo: 'PRO-006', nombre: 'Coca Cola 2L', descripcion: 'Gaseosa sabor cola', imagen: null, stock_actual: 80, stock_minimo: 20, unidad_medida: 'litro', activo: true, precio_venta: 7.50 },
    { id: 7, categoria_id: 3, codigo: 'PRO-007', nombre: 'Agua San Luis 1L', descripcion: 'Agua mineral sin gas', imagen: null, stock_actual: 100, stock_minimo: 30, unidad_medida: 'litro', activo: true, precio_venta: 2.50 },
    { id: 8, categoria_id: 4, codigo: 'PRO-008', nombre: 'Detergente Ariel 1kg', descripcion: 'Detergente en polvo para ropa', imagen: null, stock_actual: 35, stock_minimo: 10, unidad_medida: 'kg', activo: true, precio_venta: 15.90 },
    { id: 9, categoria_id: 4, codigo: 'PRO-009', nombre: 'Lejía Sapolio 1L', descripcion: 'Lejía desinfectante', imagen: null, stock_actual: 50, stock_minimo: 10, unidad_medida: 'litro', activo: true, precio_venta: 6.50 },
    { id: 10, categoria_id: 5, codigo: 'PRO-010', nombre: 'Papas Lays 150g', descripcion: 'Papas fritas sabor original', imagen: null, stock_actual: 90, stock_minimo: 20, unidad_medida: 'unidad', activo: true, precio_venta: 4.80 },
  ];
}
