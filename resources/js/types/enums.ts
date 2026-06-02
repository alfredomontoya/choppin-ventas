export enum EstadoVenta {
  Completado = 'completado',
  Anulado = 'anulado',
}

export enum EstadoOrdenCompra {
  Pendiente = 'pendiente',
  Recibido = 'recibido',
  Anulado = 'anulado',
}

export enum TipoMovimientoStock {
  IngresoCompra = 'ingreso_compra',
  IngresoManual = 'ingreso_manual',
  EgresoVenta = 'egreso_venta',
  EgresoManual = 'egreso_manual',
  Ajuste = 'ajuste',
}

export enum TipoComprobante {
  Boleta = 'boleta',
  Factura = 'factura',
}

export enum TipoPago {
  Efectivo = 'efectivo',
  Tarjeta = 'tarjeta',
  Transferencia = 'transferencia',
  Qr = 'qr',
}

export enum Moneda {
  PEN = 'PEN',
  USD = 'USD',
}

export enum Rol {
  Administrador = 'administrador',
  Vendedor = 'vendedor',
  Almacenero = 'almacenero',
  Supervisor = 'supervisor',
}
