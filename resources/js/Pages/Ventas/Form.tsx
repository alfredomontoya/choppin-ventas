import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface ProductoOption {
  id: number;
  nombre: string;
  codigo: string;
  stock_actual: number;
  precios?: { precio_venta: number; fecha_inicio: string; fecha_fin: string | null }[];
}

interface Props {
  venta?: any;
  return_url?: string;
  clientes: { id: number; nombre: string; apellido: string; numero_documento: string }[];
  productos: ProductoOption[];
}

export default function Form({ venta, return_url, clientes, productos }: Props) {
  const isEdit = !!venta;

  const { data, setData, post, put, processing, errors } = useForm({
    cliente_id: venta?.cliente_id ?? '',
    tipo_comprobante: venta?.tipo_comprobante ?? 'boleta',
    tipo_pago: venta?.tipo_pago ?? 'efectivo',
    descuento: venta?.descuento ?? 0,
    observaciones: venta?.observaciones ?? '',
    detalles: venta?.detalle?.map((d: any) => ({
      producto_id: d.producto_id,
      cantidad: Number(d.cantidad),
    })) ?? [] as { producto_id: number; cantidad: number }[],
    return_url: return_url ?? '',
  });

  const [selectedProductoId, setSelectedProductoId] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState<string>('1');

  const getPrecioVenta = (producto: ProductoOption): number => {
    if (!producto.precios?.length) return 0;
    const hoy = new Date().toISOString().slice(0, 10);
    const d = (v: string) => (v ?? '').slice(0, 10);
    const vigente = producto.precios
      .filter((p) => d(p.fecha_inicio) <= hoy && (!p.fecha_fin || d(p.fecha_fin) >= hoy))
      .sort((a, b) => b.fecha_inicio.localeCompare(a.fecha_inicio))[0];
    return vigente ? Number(vigente.precio_venta) : 0;
  };

  const productoMap = new Map(productos.map((p: ProductoOption) => [p.id, p]));

  const detalleConInfo = data.detalles.map((d: { producto_id: number; cantidad: number }) => {
    const p = productoMap.get(d.producto_id);
    return {
      ...d,
      nombre: p?.nombre ?? '—',
      codigo: p?.codigo ?? '',
      precio_unitario: p ? getPrecioVenta(p) : 0,
      subtotal: p ? getPrecioVenta(p) * d.cantidad : 0,
    };
  });

  const subtotal = detalleConInfo.reduce((sum: number, d: { subtotal: number }) => sum + d.subtotal, 0);
  const descuentoNum = Number(data.descuento) || 0;
  const total = subtotal - descuentoNum;

  const agregarDetalle = () => {
    if (!selectedProductoId) return;
    const cant = parseFloat(cantidad);
    if (isNaN(cant) || cant <= 0) return;
    if (data.detalles.some((d: { producto_id: number }) => d.producto_id === selectedProductoId)) return;

    setData('detalles', [...data.detalles, { producto_id: selectedProductoId, cantidad: cant }]);
    setSelectedProductoId(null);
    setCantidad('1');
  };

  const eliminarDetalle = (index: number) => {
    setData('detalles', data.detalles.filter((_: any, i: number) => i !== index));
  };

  const actualizarCantidad = (index: number, nuevaCantidad: number) => {
    const nuevos = [...data.detalles] as { producto_id: number; cantidad: number }[];
    nuevos[index] = { ...nuevos[index], cantidad: nuevaCantidad };
    setData('detalles', nuevos);
  };

  const productosDisponibles = productos.filter(
    (p: ProductoOption) => !data.detalles.some((d: { producto_id: number }) => d.producto_id === p.id)
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    isEdit
      ? put(route('ventas.update', venta.id))
      : post(route('ventas.store'));
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {!isEdit && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <InputLabel htmlFor="cliente_id" value="Cliente" />
              <select
                id="cliente_id"
                value={data.cliente_id}
                onChange={(e) => setData('cliente_id', e.target.value ? Number(e.target.value) : '')}
                className="mt-1.5 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Sin cliente</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} {c.apellido} — {c.numero_documento}
                  </option>
                ))}
              </select>
              <InputError message={errors.cliente_id} className="mt-2" />
            </div>

            <div>
              <InputLabel htmlFor="tipo_comprobante" value="Tipo de Comprobante" />
              <span className="text-red-500 ml-1">*</span>
              <select
                id="tipo_comprobante"
                value={data.tipo_comprobante}
                onChange={(e) => setData('tipo_comprobante', e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="boleta">Boleta</option>
                <option value="factura">Factura</option>
              </select>
              <InputError message={errors.tipo_comprobante} className="mt-2" />
            </div>

            <div>
              <InputLabel htmlFor="tipo_pago" value="Tipo de Pago" />
              <span className="text-red-500 ml-1">*</span>
              <select
                id="tipo_pago"
                value={data.tipo_pago}
                onChange={(e) => setData('tipo_pago', e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
              </select>
              <InputError message={errors.tipo_pago} className="mt-2" />
            </div>

            <div>
              <InputLabel htmlFor="descuento" value="Descuento (Bs)" />
              <input
                id="descuento"
                type="number"
                min="0"
                step="0.01"
                value={data.descuento}
                onChange={(e) => setData('descuento', e.target.value as any)}
                className="mt-1.5 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <InputError message={errors.descuento} className="mt-2" />
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Productos</h3>

            <div className="flex flex-wrap items-end gap-3 mb-4">
              <div className="flex-1 min-w-[250px]">
                <InputLabel htmlFor="producto_id" value="Producto" />
                <select
                  id="producto_id"
                  value={selectedProductoId ?? ''}
                  onChange={(e) => setSelectedProductoId(e.target.value ? Number(e.target.value) : null)}
                  className="mt-1.5 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Seleccionar producto...</option>
                  {productosDisponibles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.codigo} — {p.nombre} (Stock: {p.stock_actual})
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-28">
                <InputLabel htmlFor="cantidad" value="Cantidad" />
                <input
                  id="cantidad"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  className="mt-1.5 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="button"
                onClick={agregarDetalle}
                disabled={!selectedProductoId}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Agregar
              </button>
            </div>

            {errors.detalles && (
              <p className="text-sm text-red-600 dark:text-red-400 mb-3">{errors.detalles}</p>
            )}

            {detalleConInfo.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-slate-500 dark:text-slate-400 font-medium">Producto</th>
                      <th className="px-4 py-2 text-right text-slate-500 dark:text-slate-400 font-medium">P. Unit.</th>
                      <th className="px-4 py-2 text-right text-slate-500 dark:text-slate-400 font-medium">Cantidad</th>
                      <th className="px-4 py-2 text-right text-slate-500 dark:text-slate-400 font-medium">Subtotal</th>
                      <th className="px-4 py-2 text-right text-slate-500 dark:text-slate-400 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {detalleConInfo.map((d: any, i: number) => (
                      <tr key={i}>
                        <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{d.codigo} — {d.nombre}</td>
                        <td className="px-4 py-2 text-right text-slate-700 dark:text-slate-300">
                          Bs {d.precio_unitario.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={d.cantidad}
                            onChange={(e) => actualizarCantidad(i, parseFloat(e.target.value) || 0)}
                            className="w-20 text-right rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-4 py-2 text-right text-slate-700 dark:text-slate-300 font-medium">
                          Bs {d.subtotal.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-right">
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
                      <td colSpan={3} className="px-4 py-2 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Subtotal
                      </td>
                      <td className="px-4 py-2 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Bs {subtotal.toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                    {descuentoNum > 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-1 text-right text-sm text-slate-500">
                          Descuento
                        </td>
                        <td className="px-4 py-1 text-right text-sm text-red-500">
                          -Bs {descuentoNum.toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-right text-base font-bold text-slate-900 dark:text-white">
                        Total
                      </td>
                      <td className="px-4 py-2 text-right text-base font-bold text-indigo-600 dark:text-indigo-400">
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

      <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <PrimaryButton disabled={processing}>
          {processing ? 'Guardando...' : isEdit ? 'Actualizar' : 'Registrar Venta'}
        </PrimaryButton>
        <Link
          href={route('ventas.index')}
          className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
