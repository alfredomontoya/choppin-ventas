import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import Autocomplete from '@/Components/ui/Autocomplete';
import Modal from '@/Components/Modal';
import { Link, useForm } from '@inertiajs/react';
import { useCallback, useState } from 'react';

interface ProveedorOption {
  id: number;
  nombre: string;
  contacto: string;
  nit_ci: string;
}

interface ProductoOption {
  id: number;
  nombre: string;
  codigo: string;
  imagen: string | null;
  categoria?: { nombre: string } | null;
  precio_venta: number;
  margen_utilidad: number;
}

interface Props {
  orden?: any;
  return_url?: string;
  proveedores: ProveedorOption[];
  productos: ProductoOption[];
}

export default function Form({ orden, return_url, proveedores, productos }: Props) {
  const isEdit = !!orden;

  const { data, setData, post, put, processing, errors } = useForm({
    proveedor_id: orden?.proveedor_id ?? '',
    tipo_comprobante: orden?.tipo_comprobante ?? 'factura',
    observaciones: orden?.observaciones ?? '',
    detalles: orden?.detalle?.map((d: any) => ({
      producto_id: d.producto_id,
      cantidad: Number(d.cantidad),
      precio_unitario: Number(d.precio_unitario),
    })) ?? [] as { producto_id: number; cantidad: number; precio_unitario: number }[],
    return_url: return_url ?? '',
  });

  const productoMap = new Map(productos.map((p: ProductoOption) => [p.id, p]));

  const detalleConInfo = data.detalles.map((d: { producto_id: number; cantidad: number; precio_unitario: number }) => {
    const p = productoMap.get(d.producto_id);
    return {
      ...d,
      nombre: p?.nombre ?? '—',
      codigo: p?.codigo ?? '',
      imagen: p?.imagen ?? null,
      subtotal: d.precio_unitario * d.cantidad,
    };
  });

  const subtotal = detalleConInfo.reduce((sum: number, d: { subtotal: number }) => sum + d.subtotal, 0);
  const igv = subtotal * 0.18;
  const total = subtotal + igv;

  const agregarProducto = (productoId: number, cantidad: number = 1, precio: number = 0) => {
    const idx = data.detalles.findIndex((d: { producto_id: number }) => d.producto_id === productoId);
    if (idx >= 0) {
      const nuevos = [...data.detalles] as { producto_id: number; cantidad: number; precio_unitario: number }[];
      nuevos[idx] = { ...nuevos[idx], cantidad: nuevos[idx].cantidad + cantidad };
      setData('detalles', nuevos);
    } else {
      setData('detalles', [...data.detalles, { producto_id: productoId, cantidad, precio_unitario: precio }]);
    }
  };

  const handleSelectProducto = (producto: ProductoOption) => {
    agregarProducto(producto.id, 1, 0);
  };

  const handleSelectProveedor = (proveedor: ProveedorOption) => {
    setData('proveedor_id', proveedor.id);
  };

  const eliminarDetalle = (index: number) => {
    setData('detalles', data.detalles.filter((_: any, i: number) => i !== index));
  };

  const actualizarCantidad = (index: number, nuevaCantidad: number) => {
    const nuevos = [...data.detalles] as { producto_id: number; cantidad: number; precio_unitario: number }[];
    nuevos[index] = { ...nuevos[index], cantidad: nuevaCantidad };
    setData('detalles', nuevos);
  };

  const actualizarPrecio = (index: number, nuevoPrecio: number) => {
    const nuevos = [...data.detalles] as { producto_id: number; cantidad: number; precio_unitario: number }[];
    nuevos[index] = { ...nuevos[index], precio_unitario: nuevoPrecio };
    setData('detalles', nuevos);
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const submit = (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();
    if (isEdit) {
      put(route('compras.update', orden.id));
    } else {
      setTimeout(() => {
        post(route('compras.store'), {
          onSuccess: () => setShowConfirmModal(false),
        });
      }, 0);
    }
  };

  const abrirConfirmacion = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const proveedorSeleccionado = data.proveedor_id
    ? proveedores.find((p: ProveedorOption) => p.id === data.proveedor_id)
    : null;

  return (
    <>
    {!isEdit && (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Nueva Orden de Compra</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Crea una orden de compra para tu proveedor.
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
          {/* SECCIÓN 1: Datos de la orden — grid 2 columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Proveedor */}
            <div>
              <div className="flex items-center gap-1">
                <InputLabel htmlFor="proveedor_autocomplete" value="Proveedor" />
                <span className="text-red-500 text-sm">*</span>
              </div>
              <Autocomplete<ProveedorOption>
                items={proveedores}
                placeholder="Buscar por nombre, contacto o NIT/CI..."
                filterFn={(proveedor, query) => {
                  const q = query.toLowerCase();
                  return (
                    proveedor.nombre.toLowerCase().includes(q) ||
                    proveedor.contacto.toLowerCase().includes(q) ||
                    proveedor.nit_ci.toLowerCase().includes(q)
                  );
                }}
                renderItem={(proveedor, highlighted) => (
                  <div className={`px-3 py-2 ${highlighted ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {proveedor.nombre}
                    </p>
                    <p className="text-xs text-slate-400">
                      {proveedor.contacto} · NIT: {proveedor.nit_ci}
                    </p>
                  </div>
                )}
                onSelect={handleSelectProveedor}
                inputClassName="mt-1.5 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {proveedorSeleccionado && (
                <div className="mt-1.5 flex items-center justify-between px-3 py-1.5 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-sm">
                  <span className="text-indigo-700 dark:text-indigo-300">
                    {proveedorSeleccionado.nombre}
                  </span>
                  <button
                    type="button"
                    onClick={() => setData('proveedor_id', '')}
                    className="text-indigo-400 hover:text-indigo-600 text-xs"
                  >
                    ✕
                  </button>
                </div>
              )}
              <InputError message={errors.proveedor_id} className="mt-2" />
            </div>

            {/* Tipo Comprobante */}
            <div>
              <div className="flex items-center gap-1">
                <InputLabel htmlFor="tipo_comprobante" value="Tipo de Comprobante" />
                <span className="text-red-500 text-sm">*</span>
              </div>
              <select
                id="tipo_comprobante"
                value={data.tipo_comprobante}
                onChange={(e) => setData('tipo_comprobante', e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="factura">Factura</option>
                <option value="boleta">Boleta</option>
              </select>
              <InputError message={errors.tipo_comprobante} className="mt-2" />
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
                  </div>
                )}
                onSelect={handleSelectProducto}
                inputClassName="mt-1.5 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                      <th className="px-3 py-2 text-right text-slate-500 dark:text-slate-400 font-medium">P. Venta Actual</th>
                      <th className="px-3 py-2 text-right text-slate-500 dark:text-slate-400 font-medium">Margen %</th>
                      <th className="px-3 py-2 text-right text-slate-500 dark:text-slate-400 font-medium">P. Compra</th>
                      <th className="px-3 py-2 text-right text-slate-500 dark:text-slate-400 font-medium">Cant.</th>
                      <th className="px-3 py-2 text-right text-slate-500 dark:text-slate-400 font-medium">Subtotal</th>
                      <th className="px-3 py-2 text-right text-slate-500 dark:text-slate-400 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {detalleConInfo.map((d: any, i: number) => {
                      const prod = productoMap.get(d.producto_id);
                      return (
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
                          Bs {prod?.precio_venta?.toFixed(2) ?? '0.00'}
                        </td>
                        <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-300">
                          {prod?.margen_utilidad?.toFixed(0) ?? '30'}%
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={d.precio_unitario}
                            onChange={(e) => actualizarPrecio(i, parseFloat(e.target.value) || 0)}
                            className="w-20 text-right rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
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
                    )})}
                  </tbody>
                  <tfoot className="border-t-2 border-slate-200 dark:border-slate-700">
                    <tr>
                      <td colSpan={5} className="px-3 py-2 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Subtotal
                      </td>
                      <td className="px-3 py-2 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Bs {subtotal.toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colSpan={5} className="px-3 py-1 text-right text-sm text-slate-500">
                        IGV (18%)
                      </td>
                      <td className="px-3 py-1 text-right text-sm text-slate-500">
                        Bs {igv.toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colSpan={5} className="px-3 py-2 text-right text-base font-bold text-slate-900 dark:text-white">
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
              <p className="text-sm text-slate-400 text-center py-6">Agregue productos a la orden</p>
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

      <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <PrimaryButton
          disabled={processing}
          onClick={isEdit ? undefined : abrirConfirmacion}
          type={isEdit ? 'submit' : 'button'}
        >
          {processing ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Orden de Compra'}
        </PrimaryButton>
        <Link
          href={route('compras.index')}
          className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          Cancelar
        </Link>
      </div>
    </form>

      {/* Modal de confirmación */}
      {!isEdit && (
        <Modal show={showConfirmModal} onClose={() => setShowConfirmModal(false)} maxWidth="sm">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Confirmar Orden de Compra
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-sm text-slate-500 dark:text-slate-400">Total</span>
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  Bs {total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <PrimaryButton disabled={processing} onClick={submit}>
                {processing ? 'Guardando...' : 'Confirmar Orden'}
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
