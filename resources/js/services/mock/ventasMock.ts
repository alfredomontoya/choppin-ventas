import type { Venta } from '@/types/models';

export function getVentas(): Venta[] {
  const now = new Date();
  return [
    {
      id: 1, user_id: 1, cliente_id: 1, numero_comprobante: 'B-00000001',
      tipo_comprobante: 'boleta', fecha_emision: now.toISOString(), moneda: 'PEN',
      subtotal: 150, iva: 27, con_iva: true, descuento: 0, total: 177, tipo_pago: 'efectivo',
      observaciones: null, estado: 'completado',
      cliente: { id: 1, nombre: 'Juan', apellido: 'Pérez', tipo_documento: 'dni', numero_documento: '12345678', telefono: '999888777', email: 'j@email.com', direccion: 'Av A 123' },
      detalle: [
        { id: 1, venta_id: 1, producto_id: 1, cantidad: 2, precio_unitario: 3.50, descuento: 0, subtotal: 7, producto: { id: 1, categoria_id: 1, codigo: 'PRO-001', nombre: 'Arroz', descripcion: null, imagen: null, stock_actual: 118, stock_minimo: 10, unidad_medida: 'kg', activo: true } },
        { id: 2, venta_id: 1, producto_id: 4, cantidad: 1, precio_unitario: 5.50, descuento: 0, subtotal: 5.50, producto: { id: 4, categoria_id: 2, codigo: 'PRO-004', nombre: 'Leche', descripcion: null, imagen: null, stock_actual: 59, stock_minimo: 25, unidad_medida: 'litro', activo: true } },
      ],
    },
    {
      id: 2, user_id: 1, cliente_id: 2, numero_comprobante: 'B-00000002',
      tipo_comprobante: 'boleta', fecha_emision: new Date(now.getTime() - 3600000).toISOString(), moneda: 'PEN',
      subtotal: 280, iva: 50.40, con_iva: true, descuento: 10, total: 320.40, tipo_pago: 'tarjeta',
      observaciones: null, estado: 'completado',
      cliente: { id: 2, nombre: 'María', apellido: 'López', tipo_documento: 'dni', numero_documento: '87654321', telefono: '999111222', email: 'm@email.com', direccion: 'Jr B 456' },
    },
    {
      id: 3, user_id: 1, cliente_id: 3, numero_comprobante: 'F-00000001',
      tipo_comprobante: 'factura', fecha_emision: new Date(now.getTime() - 7200000).toISOString(), moneda: 'PEN',
      subtotal: 1200, iva: 216, con_iva: true, descuento: 50, total: 1366, tipo_pago: 'transferencia',
      observaciones: 'Pago a 30 días', estado: 'completado',
      cliente: { id: 3, nombre: 'Carlos', apellido: 'García', tipo_documento: 'ruc', numero_documento: '20123456789', telefono: '999333444', email: 'c@empresa.com', direccion: 'Av C 789' },
    },
    {
      id: 4, user_id: 1, cliente_id: null, numero_comprobante: 'B-00000003',
      tipo_comprobante: 'boleta', fecha_emision: new Date(now.getTime() - 10800000).toISOString(), moneda: 'PEN',
      subtotal: 85, iva: 15.30, con_iva: true, descuento: 0, total: 100.30, tipo_pago: 'efectivo',
      observaciones: null, estado: 'completado',
      cliente: undefined,
    },
    {
      id: 5, user_id: 1, cliente_id: 5, numero_comprobante: 'B-00000004',
      tipo_comprobante: 'boleta', fecha_emision: new Date(now.getTime() - 14400000).toISOString(), moneda: 'PEN',
      subtotal: 450, iva: 81, con_iva: true, descuento: 20, total: 511, tipo_pago: 'tarjeta',
      observaciones: null, estado: 'anulado',
      cliente: { id: 5, nombre: 'Pedro', apellido: 'Ramírez', tipo_documento: 'dni', numero_documento: '78945612', telefono: '999777888', email: 'p@email.com', direccion: 'Av D 654' },
    },
  ];
}
