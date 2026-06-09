import type { DashboardResumen, Venta, Producto } from '@/types/models';

const now = new Date();
const diasSemana = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(now);
  d.setDate(d.getDate() - (6 - i));
  return d.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric' });
});

export function getDashboardResumen(): DashboardResumen {
  return {
    ventas_hoy: 24,
    ventas_trend: 12,
    ingresos_hoy: 4520.50,
    ingresos_trend: 8,
    productos_agotados: 3,
    ordenes_pendientes: 5,
    ingresos_semana: [
      { fecha: diasSemana[0], total: 3200 },
      { fecha: diasSemana[1], total: 4100 },
      { fecha: diasSemana[2], total: 2800 },
      { fecha: diasSemana[3], total: 5100 },
      { fecha: diasSemana[4], total: 3900 },
      { fecha: diasSemana[5], total: 4520 },
      { fecha: diasSemana[6], total: 4800 },
    ],
    ventas_recientes: getVentasRecientes(),
    stock_bajo: getStockBajo(),
  };
}

export function getVentasRecientes(): Venta[] {
  return [
    {
      id: 1, user_id: 1, cliente_id: 1, numero_comprobante: 'B-00000001',
      tipo_comprobante: 'boleta', fecha_emision: now.toISOString(),
      moneda: 'PEN', subtotal: 150, iva: 27, con_iva: true, descuento: 0, total: 177,
      tipo_pago: 'efectivo', observaciones: null, estado: 'completado',
      cliente: { id: 1, nombre: 'Juan', apellido: 'Pérez', tipo_documento: 'dni', numero_documento: '12345678', telefono: '999888777', email: 'juan@email.com', direccion: 'Av. Principal 123' },
    },
    {
      id: 2, user_id: 1, cliente_id: 2, numero_comprobante: 'B-00000002',
      tipo_comprobante: 'boleta', fecha_emision: new Date(now.getTime() - 3600000).toISOString(),
      moneda: 'PEN', subtotal: 280, iva: 50.40, con_iva: true, descuento: 10, total: 320.40,
      tipo_pago: 'tarjeta', observaciones: null, estado: 'completado',
      cliente: { id: 2, nombre: 'María', apellido: 'López', tipo_documento: 'dni', numero_documento: '87654321', telefono: '999111222', email: 'maria@email.com', direccion: 'Jr. Las Flores 456' },
    },
    {
      id: 3, user_id: 1, cliente_id: 3, numero_comprobante: 'F-00000001',
      tipo_comprobante: 'factura', fecha_emision: new Date(now.getTime() - 7200000).toISOString(),
      moneda: 'PEN', subtotal: 1200, iva: 216, con_iva: true, descuento: 50, total: 1366,
      tipo_pago: 'transferencia', observaciones: null, estado: 'completado',
      cliente: { id: 3, nombre: 'Carlos', apellido: 'García', tipo_documento: 'ruc', numero_documento: '20123456789', telefono: '999333444', email: 'carlos@empresa.com', direccion: 'Av. Industrial 789' },
    },
    {
      id: 4, user_id: 1, cliente_id: null, numero_comprobante: 'B-00000003',
      tipo_comprobante: 'boleta', fecha_emision: new Date(now.getTime() - 10800000).toISOString(),
      moneda: 'PEN', subtotal: 85, iva: 15.30, con_iva: true, descuento: 0, total: 100.30,
      tipo_pago: 'efectivo', observaciones: null, estado: 'completado',
    },
    {
      id: 5, user_id: 1, cliente_id: 5, numero_comprobante: 'B-00000004',
      tipo_comprobante: 'boleta', fecha_emision: new Date(now.getTime() - 14400000).toISOString(),
      moneda: 'PEN', subtotal: 450, iva: 81, con_iva: true, descuento: 20, total: 511,
      tipo_pago: 'tarjeta', observaciones: null, estado: 'anulado',
      cliente: { id: 5, nombre: 'Pedro', apellido: 'Ramírez', tipo_documento: 'dni', numero_documento: '78945612', telefono: '999777888', email: 'pedro@email.com', direccion: 'Av. Central 654' },
    },
  ];
}

export function getStockBajo(): Producto[] {
  return [
    { id: 1, categoria_id: 1, codigo: 'PRO-001', nombre: 'Arroz', descripcion: null, imagen: null, stock_actual: 2, stock_minimo: 10, unidad_medida: 'kg', activo: true },
    { id: 2, categoria_id: 2, codigo: 'PRO-002', nombre: 'Aceite', descripcion: null, imagen: null, stock_actual: 5, stock_minimo: 15, unidad_medida: 'litro', activo: true },
    { id: 3, categoria_id: 1, codigo: 'PRO-003', nombre: 'Azúcar', descripcion: null, imagen: null, stock_actual: 0, stock_minimo: 20, unidad_medida: 'kg', activo: true },
    { id: 4, categoria_id: 3, codigo: 'PRO-004', nombre: 'Leche', descripcion: null, imagen: null, stock_actual: 3, stock_minimo: 25, unidad_medida: 'litro', activo: true },
  ];
}
