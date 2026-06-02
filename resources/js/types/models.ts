export interface User {
  id: number;
  name: string;
  email: string;
  activo: boolean;
  ultimo_acceso: string | null;
  roles: string[];
  permissions: string[];
  created_by: number | null;
  updated_by: number | null;
  deleted_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  tipo_documento: 'dni' | 'ce' | 'ruc';
  numero_documento: string;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
}

export interface Proveedor {
  id: number;
  nombre: string;
  contacto: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  ruc: string | null;
  activo: boolean;
}

export interface CategoriaProducto {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

export interface Producto {
  id: number;
  categoria_id: number;
  categoria?: CategoriaProducto;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  imagen: string | null;
  stock_actual: number;
  stock_minimo: number;
  unidad_medida: string;
  activo: boolean;
  precio_venta?: number;
}

export interface PrecioProducto {
  id: number;
  producto_id: number;
  precio_compra: number;
  precio_venta: number;
  fecha_inicio: string;
  fecha_fin: string | null;
}

export interface Venta {
  id: number;
  user_id: number;
  user?: User;
  cliente_id?: number | null;
  cliente?: Cliente | null;
  numero_comprobante: string;
  tipo_comprobante: string;
  fecha_emision: string;
  moneda: string;
  subtotal: number;
  igv: number;
  descuento: number;
  total: number;
  tipo_pago: string;
  observaciones: string | null;
  estado: string;
  detalle?: DetalleVenta[];
}

export interface DetalleVenta {
  id: number;
  venta_id: number;
  producto_id: number;
  producto?: Producto;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  subtotal: number;
}

export interface OrdenCompra {
  id: number;
  proveedor_id: number;
  proveedor?: Proveedor;
  user_id: number;
  user?: User;
  numero_comprobante: string;
  tipo_comprobante: string;
  fecha_emision: string;
  moneda: string;
  subtotal: number;
  igv: number;
  total: number;
  observaciones: string | null;
  estado: string;
}

export interface MovimientoStock {
  id: number;
  producto_id: number;
  producto?: Producto;
  user_id: number;
  tipo: string;
  cantidad: number;
  stock_anterior: number;
  stock_posterior: number;
  referencia_type: string | null;
  referencia_id: number | null;
  motivo: string | null;
}

export interface DashboardResumen {
  ventas_hoy: number;
  ventas_trend: number;
  ingresos_hoy: number;
  ingresos_trend: number;
  productos_agotados: number;
  ordenes_pendientes: number;
  ingresos_semana: { fecha: string; total: number }[];
  ventas_recientes: Venta[];
  stock_bajo: Producto[];
}

export interface RolYPermisos {
  id: number;
  name: string;
  permissions: string[];
}

export interface ReporteVenta {
  id: number;
  user_id: number;
  user?: User;
  cliente_id?: number | null;
  cliente?: Cliente | null;
  numero_comprobante: string;
  tipo_comprobante: string;
  fecha_emision: string;
  moneda: string;
  subtotal: number;
  igv: number;
  descuento: number;
  total: number;
  tipo_pago: string;
  estado: string;
}

export interface ReporteVentasResumen {
  total_ventas: number;
  subtotal: number;
  igv: number;
  descuento: number;
  total_ingresos: number;
}

export interface ReporteCompra {
  id: number;
  proveedor_id: number;
  proveedor?: Proveedor;
  user_id: number;
  user?: User;
  numero_comprobante: string;
  tipo_comprobante: string;
  fecha_emision: string;
  moneda: string;
  subtotal: number;
  igv: number;
  total: number;
  estado: string;
}

export interface ReporteComprasResumen {
  total_compras: number;
  subtotal: number;
  igv: number;
  total_gastos: number;
}

export interface ReporteRentabilidad {
  producto_id: number;
  nombre: string;
  codigo: string;
  categoria: string | null;
  cantidad_vendida: number;
  precio_promedio: number;
  ingreso_total: number;
  costo_total: number;
  ganancia_total: number;
  margen: number;
}

export interface ReporteRentabilidadResumen {
  total_productos_vendidos: number;
  ingreso_total: number;
  productos_distintos: number;
}

export interface ReporteMovimiento {
  id: number;
  producto_id: number;
  producto?: Producto;
  user_id: number;
  tipo: string;
  cantidad: number;
  stock_anterior: number;
  stock_posterior: number;
  motivo: string | null;
  created_at: string;
}

export interface ReporteMovimientosResumen {
  total_movimientos: number;
  ingresos: number;
  egresos: number;
}

export interface ReporteCliente {
  id: number;
  nombre_completo: string;
  tipo_documento: string;
  numero_documento: string;
  telefono: string | null;
  email: string | null;
  total_compras: number;
  monto_total: number;
  promedio_compra: number;
  ultima_compra: string | null;
}

export interface ReporteClientesResumen {
  total_clientes: number;
  total_ingresos: number;
  promedio_general: number;
}

export interface ModuloPermisos {
  modulo: string;
  label: string;
  permisos: string[];
}

export interface Correlativo {
  id: number;
  tipo: string;
  ultimo: number;
  reiniciar_anual: boolean;
  year: number | null;
  ultimo_reset_en: string | null;
  resets_count: number;
  ultimo_reset: CorrelativoReset | null;
}

export interface CorrelativoReset {
  glosa: string;
  user_name: string;
  created_at: string;
}
