<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ $tipo === 'factura' ? 'Factura' : 'Nota de Venta' }} #{{ $venta->numero_comprobante }}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 12px;
      color: #000;
      width: 80mm;
      margin: 0 auto;
      padding: 10px 5px;
    }
    .header { text-align: center; margin-bottom: 10px; }
    .header h1 { font-size: 16px; font-weight: bold; text-transform: uppercase; }
    .header .tipo { font-size: 14px; font-weight: bold; border: 2px solid #000; display: inline-block; padding: 2px 15px; margin: 5px 0; }
    .header .info { font-size: 10px; }
    hr { border: none; border-top: 1px dashed #000; margin: 6px 0; }
    .cliente { margin-bottom: 6px; font-size: 11px; }
    .cliente p { line-height: 1.4; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    table th { border-bottom: 1px solid #000; padding: 4px 2px; text-align: left; font-size: 10px; text-transform: uppercase; }
    table td { padding: 4px 2px; border-bottom: 1px dotted #ccc; vertical-align: top; }
    table td.right, table th.right { text-align: right; }
    table td.center, table th.center { text-align: center; }
    .totals { margin-top: 6px; text-align: right; font-size: 11px; }
    .totals .line { display: flex; justify-content: space-between; padding: 2px 0; }
    .totals .total-final { font-size: 14px; font-weight: bold; border-top: 1px solid #000; padding-top: 4px; margin-top: 4px; }
    .pago { margin-top: 8px; text-align: center; font-size: 11px; }
    .footer { margin-top: 10px; text-align: center; font-size: 10px; }
    .footer p { line-height: 1.4; }
    @media print {
      body { width: 100%; }
      .no-print { display: none; }
      @page { margin: 0; }
    }
    .no-print { text-align: center; margin-bottom: 10px; }
    .no-print button {
      font-family: Arial, sans-serif;
      padding: 8px 20px;
      background: #4f46e5;
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      cursor: pointer;
    }
    .no-print button:hover { background: #4338ca; }
  </style>
</head>
<body>
  <div class="no-print">
    <button onclick="window.print()">🖨️ Imprimir</button>
    <button onclick="window.close()" style="margin-left:8px;background:#6b7280;">✕ Cerrar</button>
  </div>

  <div class="header">
    <h1>{{ config('ventas.store.name') }}</h1>
    <p class="info">{{ config('ventas.store.address') }}</p>
    <p class="info">Teléfono: {{ config('ventas.store.phone') }}</p>
    <p class="info">NIT: {{ config('ventas.store.nit') }}</p>
    <div class="tipo">{{ $tipo === 'factura' ? 'FACTURA' : 'NOTA DE VENTA' }}</div>
    <p class="info">N° <strong>{{ $venta->numero_comprobante }}</strong></p>
    <p class="info">{{ $venta->fecha_emision->format('d/m/Y H:i') }}</p>
  </div>

  <hr>

  @if($venta->cliente)
  <div class="cliente">
    <p><strong>Cliente:</strong> {{ $venta->cliente->nombre }}</p>
    @if($venta->cliente->tipo_documento && $venta->cliente->numero_documento)
      <p><strong>{{ strtoupper($venta->cliente->tipo_documento) }}:</strong> {{ $venta->cliente->numero_documento }}</p>
    @endif
    @if($venta->cliente->direccion)
      <p><strong>Dirección:</strong> {{ $venta->cliente->direccion }}</p>
    @endif
  </div>
  <hr>
  @endif

  <table>
    <thead>
      <tr>
        <th class="center">Cant</th>
        <th>Producto</th>
        <th class="right">P.Unit</th>
        <th class="right">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      @foreach($venta->detalle as $d)
      <tr>
        <td class="center">{{ number_format($d->cantidad, 1) }}</td>
        <td>{{ $d->producto->nombre ?? '—' }}</td>
        <td class="right">{{ number_format($d->precio_unitario, 2) }}</td>
        <td class="right">{{ number_format($d->subtotal, 2) }}</td>
      </tr>
      @endforeach
    </tbody>
  </table>

  <div class="totals">
    <div class="line">
      <span>Subtotal</span>
      <span>{{ number_format($venta->subtotal, 2) }}</span>
    </div>
    @if((float)$venta->descuento > 0)
    <div class="line">
      <span>Descuento</span>
      <span>-{{ number_format($venta->descuento, 2) }}</span>
    </div>
    @endif
    <div class="line" style="font-size:10px;color:#666;">
      <span>Base IVA</span>
      <span>{{ number_format($venta->subtotal - $venta->descuento, 2) }}</span>
    </div>
    <div class="line" style="font-size:11px;">
      <span>IVA {{ $venta->con_iva ? '(13%)' : '(exento)' }}</span>
      <span>{{ number_format($venta->iva, 2) }}</span>
    </div>
    <div class="line total-final">
      <span>TOTAL</span>
      <span>{{ number_format($venta->total, 2) }}</span>
    </div>
    @if($venta->monto_recibido)
    <div class="line">
      <span>Recibido</span>
      <span>{{ number_format($venta->monto_recibido, 2) }}</span>
    </div>
    @endif
    @if($venta->cambio)
    <div class="line">
      <span>Cambio</span>
      <span>{{ number_format($venta->cambio, 2) }}</span>
    </div>
    @endif
  </div>

  <hr>

  <div class="pago">
    <strong>Forma de pago:</strong>
    {{ match($venta->tipo_pago) { 'efectivo' => 'Efectivo', 'tarjeta' => 'Tarjeta', 'qr' => 'QR', 'transferencia' => 'Transferencia', default => ucfirst($venta->tipo_pago) } }}
  </div>

  @if($venta->observaciones)
  <hr>
  <div>
    <p><strong>Observaciones:</strong> {{ $venta->observaciones }}</p>
  </div>
  @endif

  <hr>

  <div class="footer">
    <p>¡Gracias por su compra!</p>
    <p>Atendido por: {{ $venta->user->name ?? '—' }}</p>
    <p style="margin-top:4px;font-size:9px;">{{ $tipo === 'factura' ? 'Esta factura es válida como respaldo fiscal.' : 'Nota de venta sin valor fiscal.' }}</p>
  </div>

  <script>
    window.onload = function() { setTimeout(function() { window.print(); }, 400); };
  </script>
</body>
</html>
