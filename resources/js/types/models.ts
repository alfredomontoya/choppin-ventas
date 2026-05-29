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
  ingresos_hoy: number;
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

export interface ModuloPermisos {
  modulo: string;
  label: string;
  permisos: string[];
}
