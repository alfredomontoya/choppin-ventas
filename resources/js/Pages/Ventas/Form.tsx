import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import Autocomplete from '@/Components/ui/Autocomplete';
import FavoritosGrid from '@/Components/ui/FavoritosGrid';
import Modal from '@/Components/Modal';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useCallback, useState } from 'react';
import toast from 'react-hot-toast';

interface ClienteOption {
  id: number;
  nombre: string;
  apellido: string;
  tipo_documento: string;
  numero_documento: string;
}

interface ProductoOption {
  id: number;
  nombre: string;
  codigo: string;
  imagen: string | null;
  stock_actual: number;
  categoria?: { nombre: string } | null;
  precios?: { precio_venta: number; fecha_inicio: string; fecha_fin: string | null }[];
  precio_venta?: number;
}

interface Props {
  venta?: any;
  return_url?: string;
  clientes: ClienteOption[];
  productos: ProductoOption[];
  productosFavoritos: ProductoOption[];
  qrImage?: string | null;
}

export default function Form({ venta, return_url, clientes, productos, productosFavoritos }: Props) {
  const isEdit = !!venta;

  const { data, setData, post, put, processing, errors } = useForm({
    cliente_id: venta?.cliente_id ?? null,
    tipo_comprobante: venta?.tipo_comprobante ?? 'boleta',
    tipo_pago: venta?.tipo_pago ?? 'efectivo',
    descuento: venta?.descuento ?? 0,
    monto_recibido: venta?.monto_recibido ?? '',
    cambio: venta?.cambio ?? '',
    observaciones: venta?.observaciones ?? '',
    detalles: venta?.detalle?.map((d: any) => ({
      producto_id: d.producto_id,
      cantidad: Number(d.cantidad),
    })) ?? [] as { producto_id: number; cantidad: number }[],
    return_url: return_url ?? '',
  });

  const getPrecioVenta = useCallback((producto: ProductoOption): number => {
    if (producto.precio_venta !== undefined) return Number(producto.precio_venta);
    if (!producto.precios?.length) return 0;
    const hoy = new Date().toISOString().slice(0, 10);
    const d = (v: string) => (v ?? '').slice(0, 10);
    const vigente = producto.precios
      .filter((p) => d(p.fecha_inicio) <= hoy && (!p.fecha_fin || d(p.fecha_fin) >= hoy))
      .sort((a, b) => b.fecha_inicio.localeCompare(a.fecha_inicio))[0];
    return vigente ? Number(vigente.precio_venta) : 0;
  }, []);

  const productoMap = new Map(productos.map((p: ProductoOption) => [p.id, p]));

  const detalleConInfo = data.detalles.map((d: { producto_id: number; cantidad: number }) => {
    const p = productoMap.get(d.producto_id);
    return {
      ...d,
      nombre: p?.nombre ?? '—',
      codigo: p?.codigo ?? '',
      imagen: p?.imagen ?? null,
      precio_unitario: p ? getPrecioVenta(p) : 0,
      subtotal: p ? getPrecioVenta(p) * d.cantidad : 0,
    };
  });

  const subtotal = detalleConInfo.reduce((sum: number, d: { subtotal: number }) => sum + d.subtotal, 0);
  const descuentoNum = Number(data.descuento) || 0;
  const total = subtotal - descuentoNum;

  useEffect(() => {
    if (erroresLocal.tipo_comprobante && data.tipo_comprobante) {
      setErroresLocal((prev) => { const { tipo_comprobante: _, ...rest } = prev; return rest; });
    }
    if (erroresLocal.tipo_pago && data.tipo_pago) {
      setErroresLocal((prev) => { const { tipo_pago: _, ...rest } = prev; return rest; });
    }
    if (erroresLocal.detalles && data.detalles.length > 0) {
      setErroresLocal((prev) => { const { detalles: _, ...rest } = prev; return rest; });
    }
    if (showQRSection && data.tipo_pago !== 'qr') {
      setShowQRSection(false);
    }
  }, [data.tipo_comprobante, data.tipo_pago, data.detalles.length]);

  const agregarODimensionar = (productoId: number, cantidad: number = 1) => {
    const idx = data.detalles.findIndex((d: { producto_id: number }) => d.producto_id === productoId);
    if (idx >= 0) {
      const nuevos = [...data.detalles] as { producto_id: number; cantidad: number }[];
      nuevos[idx] = { ...nuevos[idx], cantidad: nuevos[idx].cantidad + cantidad };
      setData('detalles', nuevos);
    } else {
      setData('detalles', [...data.detalles, { producto_id: productoId, cantidad }]);
    }
  };

  const handleSelectProducto = (producto: ProductoOption) => {
    agregarODimensionar(producto.id, 1);
  };

  const handleProductoSubmitQuery = (query: string) => {
    const q = query.toLowerCase().trim();
    const producto = productos.find(
      (p) => p.codigo.toLowerCase() === q,
    );
    if (producto) {
      agregarODimensionar(producto.id, 1);
    } else {
      toast.error(`Producto "${query}" no encontrado`);
    }
  };

  const handleSelectCliente = (cliente: ClienteOption) => {
    setData('cliente_id', cliente.id);
  };

  const eliminarDetalle = (index: number) => {
    setData('detalles', data.detalles.filter((_: any, i: number) => i !== index));
  };

  const actualizarCantidad = (index: number, nuevaCantidad: number) => {
    const nuevos = [...data.detalles] as { producto_id: number; cantidad: number }[];
    nuevos[index] = { ...nuevos[index], cantidad: nuevaCantidad };
    setData('detalles', nuevos);
  };

  const { props: pageProps } = usePage();
  const qrImage = (pageProps as any).qrImage ?? null;

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showQRSection, setShowQRSection] = useState(false);
  const [montoRecibido, setMontoRecibido] = useState<string>('0');
  const [erroresLocal, setErroresLocal] = useState<Record<string, string>>({});

  const submit = (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();
    if (isEdit) {
      put(route('ventas.update', venta.id));
    } else {
      setData('monto_recibido', montoRecibido);
      setData('cambio', parseFloat(cambio.toFixed(2)));
      post(route('ventas.store'), {
        onSuccess: () => {
          setShowConfirmModal(false);
          setShowQRSection(false);
        },
      });
    }
  };

  const abrirConfirmacion = (e: React.MouseEvent) => {
    e.preventDefault();
    const nuevosErrores: Record<string, string> = {};

    if (!data.tipo_comprobante) nuevosErrores.tipo_comprobante = 'Seleccione un tipo de comprobante';
    if (!data.tipo_pago) nuevosErrores.tipo_pago = 'Seleccione un tipo de pago';
    if (data.detalles.length === 0) nuevosErrores.detalles = 'Agregue al menos un producto';

    setErroresLocal(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) return;

    if (data.tipo_pago === 'qr') {
      setShowQRSection(true);
    } else {
      setMontoRecibido(total > 0 ? total.toFixed(2) : '0');
      setShowConfirmModal(true);
    }
  };

  const cambio = Math.max(0, (parseFloat(montoRecibido) || 0) - total);

  const clienteSeleccionado = data.cliente_id
    ? clientes.find((c) => c.id === data.cliente_id)
    : null;

  return (
    <>
    {!isEdit && (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Nueva Venta</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Registra una nueva venta seleccionando los productos.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Total</p>
          <p className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 tabular-nums leading-tight">
            Bs {total.toFixed(2)}
          </p>
        </div>
      </div>
    )}
    <form onSubmit={submit} className="space-y-6">
      {!isEdit && (
        <>
          {/* SECCIÓN 1: Datos de la venta — grid 2 columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Cliente */}
            <div>
              <div className="flex items-center gap-2">
                <InputLabel htmlFor="cliente_autocomplete" value="Cliente" />
                {clienteSeleccionado && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-xs font-medium text-indigo-700 dark:text-indigo-300">
                    {clienteSeleccionado.nombre} {clienteSeleccionado.apellido}
                    <button
                      type="button"
                      onClick={() => setData('cliente_id', null)}
                      className="text-indigo-400 hover:text-indigo-600 ml-0.5"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
              <Autocomplete<ClienteOption>
                items={clientes}
                placeholder="Buscar por nombre o documento..."
                filterFn={(cliente, query) => {
                  const q = query.toLowerCase();
                  return (
                    cliente.nombre.toLowerCase().includes(q) ||
                    cliente.apellido.toLowerCase().includes(q) ||
                    cliente.numero_documento.toLowerCase().includes(q)
                  );
                }}
                renderItem={(cliente, highlighted) => (
                  <div className={`px-3 py-2 ${highlighted ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {cliente.nombre} {cliente.apellido}
                    </p>
                    <p className="text-xs text-slate-400">
                      {cliente.tipo_documento.toUpperCase()}: {cliente.numero_documento}
                    </p>
                  </div>
                )}
                onSelect={handleSelectCliente}
                inputClassName="mt-1.5 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <InputError message={errors.cliente_id} className="mt-2" />
            </div>

            {/* Tipo Pago — Radio Buttons */}
            <div>
              <div className="flex items-center gap-1">
                <InputLabel value="Tipo de Pago" />
                <span className="text-red-500 text-sm">*</span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-3">
                {[
                  { value: 'efectivo', label: 'Efectivo' },
                  { value: 'tarjeta', label: 'Tarjeta' },
                  { value: 'transferencia', label: 'Transferencia' },
                  { value: 'qr', label: 'QR' },
                ].map((op) => (
                  <label
                    key={op.value}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all text-sm ${
                      data.tipo_pago === op.value
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tipo_pago"
                      value={op.value}
                      checked={data.tipo_pago === op.value}
                      onChange={(e) => setData('tipo_pago', e.target.value)}
                      className="accent-indigo-600"
                    />
                    {op.label}
                  </label>
                ))}
              </div>
              <InputError message={errors.tipo_pago} className="mt-2" />
            </div>

          </div>

          {/* SECCIÓN 2: Productos */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Productos</h3>

            {/* Producto Autocomplete */}
            <div className="mb-4">
              <InputLabel htmlFor="producto_autocomplete" value="Producto" />
              <Autocomplete<ProductoOption>
                items={productos}
                placeholder="Buscar por nombre o código..."
                filterFn={(producto, query) => {
                  const q = query.toLowerCase();
                  return (
                    producto.nombre.toLowerCase().includes(q) ||
                    producto.codigo.toLowerCase().includes(q)
                  );
                }}
                renderItem={(producto, highlighted) => (
                  <div className={`flex items-center gap-3 px-3 py-2 ${highlighted ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}>
                    <div className="w-10 h-10 rounded-md bg-slate-100 dark:bg-slate-600 overflow-hidden flex-shrink-0">
                      {producto.imagen ? (
                        <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                          ✕
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-400 truncate">{producto.categoria?.nombre ?? ''}</p>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{producto.nombre}</p>
                    </div>
                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                      Bs {getPrecioVenta(producto).toFixed(2)}
                    </p>
                  </div>
                )}
                onSelect={handleSelectProducto}
                onSubmitQuery={handleProductoSubmitQuery}
                inputClassName="mt-1.5 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Favoritos */}
            <div className="mb-4">
              <FavoritosGrid
                productos={productosFavoritos}
                onAgregar={(p) => agregarODimensionar(p.id, 1)}
              />
            </div>

            {/* Tabla Detalle */}
            {errors.detalles && (
              <p className="text-sm text-red-600 dark:text-red-400 mb-3">{errors.detalles}</p>
            )}

            {detalleConInfo.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-3 py-2 text-left text-slate-500 dark:text-slate-400 font-medium">Producto</th>
                      <th className="px-3 py-2 text-right text-slate-500 dark:text-slate-400 font-medium">P. Unit.</th>
                      <th className="px-3 py-2 text-right text-slate-500 dark:text-slate-400 font-medium">Cant.</th>
                      <th className="px-3 py-2 text-right text-slate-500 dark:text-slate-400 font-medium">Subtotal</th>
                      <th className="px-3 py-2 text-right text-slate-500 dark:text-slate-400 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {detalleConInfo.map((d: any, i: number) => (
                      <tr key={i}>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-300">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-600 overflow-hidden flex-shrink-0">
                              {d.imagen ? (
                                <img src={d.imagen} alt={d.nombre} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">✕</div>
                              )}
                            </div>
                            <span className="truncate">{d.codigo} — {d.nombre}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-300">
                          Bs {d.precio_unitario.toFixed(2)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={d.cantidad}
                            onChange={(e) => actualizarCantidad(i, parseFloat(e.target.value) || 0)}
                            className="w-16 text-right rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-300 font-medium">
                          Bs {d.subtotal.toFixed(2)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => eliminarDetalle(i)}
                            className="p-1 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-slate-200 dark:border-slate-700">
                    <tr>
                      <td colSpan={3} className="px-3 py-2 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Subtotal
                      </td>
                      <td className="px-3 py-2 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Bs {subtotal.toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                    {descuentoNum > 0 && (
                      <tr>
                        <td colSpan={3} className="px-3 py-1 text-right text-sm text-slate-500">
                          Descuento
                        </td>
                        <td className="px-3 py-1 text-right text-sm text-red-500">
                          -Bs {descuentoNum.toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan={3} className="px-3 py-2 text-right text-base font-bold text-slate-900 dark:text-white">
                        Total
                      </td>
                      <td className="px-3 py-2 text-right text-base font-bold text-indigo-600 dark:text-indigo-400">
                        Bs {total.toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-6">Agregue productos a la venta</p>
            )}
          </div>
        </>
      )}

      {/* SECCIÓN 3: Observaciones */}
      <div>
        <InputLabel htmlFor="observaciones" value="Observaciones" />
        <textarea
          id="observaciones"
          rows={3}
          value={data.observaciones}
          onChange={(e) => setData('observaciones', e.target.value)}
          className="mt-1.5 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <InputError message={errors.observaciones} className="mt-2" />
      </div>

      <div className="h-6" />

      {Object.keys(erroresLocal).length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 space-y-1">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">Corrija los siguientes errores:</p>
          <ul className="text-sm text-red-600 dark:text-red-300 list-disc list-inside">
            {erroresLocal.tipo_comprobante && <li>{erroresLocal.tipo_comprobante}</li>}
            {erroresLocal.tipo_pago && <li>{erroresLocal.tipo_pago}</li>}
            {erroresLocal.detalles && <li>{erroresLocal.detalles}</li>}
          </ul>
        </div>
      )}

      {!showQRSection && (
        <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <PrimaryButton
            disabled={processing}
            onClick={isEdit ? undefined : abrirConfirmacion}
            type={isEdit ? 'submit' : 'button'}
          >
            {processing ? 'Guardando...' : isEdit ? 'Actualizar' : 'Registrar Venta'}
          </PrimaryButton>
          <Link
            href={route('ventas.index')}
            className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      )}
    </form>

      {/* Sección QR */}
      {!isEdit && showQRSection && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Pago con QR</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Escanea el código QR desde tu aplicación bancaria para pagar
            </p>
          </div>
          <div className="p-6">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                {qrImage ? (
                  <img
                    src={qrImage}
                    alt="QR de cobro"
                    className="w-80 h-80 object-contain border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                ) : (
                  <div className="w-80 h-80 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-400 text-sm">
                    QR no configurado
                  </div>
                )}
              </div>
              <div className="flex-1 w-full space-y-4">
                <div>
                  <InputLabel htmlFor="descuento_qr" value="Descuento (Bs)" />
                  <input
                    id="descuento_qr"
                    type="number"
                    min="0"
                    step="0.01"
                    value={data.descuento}
                    onChange={(e) => setData('descuento', e.target.value as any)}
                    className="mt-1.5 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Total a pagar</span>
                  <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    Bs {total.toFixed(2)}
                  </span>
                </div>

                {clienteSeleccionado && (
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Cliente: <span className="font-medium text-slate-800 dark:text-slate-200">
                      {clienteSeleccionado.nombre} {clienteSeleccionado.apellido}
                    </span>
                  </div>
                )}

                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Comprobante: <span className="font-medium text-slate-800 dark:text-slate-200">
                    {data.tipo_comprobante === 'boleta' ? 'Boleta' : 'Factura'}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Productos:</p>
                  <div className="divide-y divide-slate-100 dark:divide-slate-700/50 max-h-40 overflow-y-auto">
                    {detalleConInfo.map((d: any, i: number) => (
                      <div key={i} className="flex justify-between py-1.5 text-sm">
                        <span className="text-slate-600 dark:text-slate-400 truncate mr-4">
                          {d.nombre} x{d.cantidad}
                        </span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium flex-shrink-0">
                          Bs {d.subtotal.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end gap-3">
            <p className="text-xs text-slate-400 flex-1">
              El cajero debe confirmar el pago después de verificar la transacción en su aplicación bancaria.
            </p>
            <button
              type="button"
              onClick={() => setShowQRSection(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Cancelar
            </button>
            <PrimaryButton
              disabled={processing}
              onClick={submit}
            >
              {processing ? 'Guardando...' : 'Confirmar pago recibido'}
            </PrimaryButton>
          </div>
        </div>
      )}

      {/* Modal de confirmación */}
      {!isEdit && (
        <Modal show={showConfirmModal} onClose={() => setShowConfirmModal(false)} maxWidth="sm">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Confirmar Venta
            </h3>

            <div className="space-y-4">
              <div>
                <InputLabel htmlFor="descuento_modal" value="Descuento (Bs)" />
                <input
                  id="descuento_modal"
                  type="number"
                  min="0"
                  step="0.01"
                  value={data.descuento}
                  onChange={(e) => setData('descuento', e.target.value as any)}
                  className="mt-1.5 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-sm text-slate-500 dark:text-slate-400">Total</span>
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  Bs {total.toFixed(2)}
                </span>
              </div>

              <div>
                <InputLabel htmlFor="monto_recibido" value="Monto recibido" />
                <input
                  id="monto_recibido"
                  type="number"
                  min="0"
                  step="0.01"
                  value={montoRecibido}
                  onChange={(e) => setMontoRecibido(e.target.value)}
                  className="mt-1.5 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              <div className="flex justify-between items-center py-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-sm text-slate-500 dark:text-slate-400">Cambio</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  Bs {cambio.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <PrimaryButton disabled={processing || (parseFloat(montoRecibido) || 0) < total} onClick={submit}>
                {processing ? 'Guardando...' : 'Confirmar Venta'}
              </PrimaryButton>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
