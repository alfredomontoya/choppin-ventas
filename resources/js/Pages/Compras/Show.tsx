import { Head, Link, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card } from '@/Components/ui/Card';
import { ConfirmDialog } from '@/Components/ui/ConfirmDialog';
import { getReturnUrl, saveReturnUrl } from '@/lib/navigation';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import toast from 'react-hot-toast';
import { useEffect, useState, useCallback } from 'react';

const currency = (n: number) => {
  if (n == null || isNaN(n)) return 'Bs 0.00';
  return `Bs ${Number(n).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

interface Discrepancia {
  producto_id: number;
  producto_nombre: string;
  precio_compra_actual: number;
  precio_venta_actual: number;
  precio_unitario_orden: number;
  margen_utilidad: number;
  nuevo_precio_venta_sugerido: number;
}

export default function Show({ orden }: { orden: any }) {
  const { flash } = usePage().props as any;
  const [showAnular, setShowAnular] = useState(false);
  const [showRecibir, setShowRecibir] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [discrepancias, setDiscrepancias] = useState<Discrepancia[] | null>(null);
  const [loadingDiscrepancias, setLoadingDiscrepancias] = useState(false);
  const [preciosEditados, setPreciosEditados] = useState<Record<number, number>>({});
  const [margenesEditados, setMargenesEditados] = useState<Record<number, number>>({});

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  const abrirRecibir = useCallback(async () => {
    setLoadingDiscrepancias(true);
    setShowRecibir(true);

    try {
      const res = await fetch(route('compras.verificar-precios', orden.id));
      const data = await res.json();
      setDiscrepancias(data.discrepancias ?? []);

      const edits: Record<number, number> = {};
      const margs: Record<number, number> = {};
      for (const d of data.discrepancias ?? []) {
        edits[d.producto_id] = d.nuevo_precio_venta_sugerido;
        margs[d.producto_id] = d.margen_utilidad;
      }
      setPreciosEditados(edits);
      setMargenesEditados(margs);
    } catch {
      setDiscrepancias([]);
    } finally {
      setLoadingDiscrepancias(false);
    }
  }, [orden.id]);

  const anular = () => {
    router.delete(route('compras.destroy', orden.id), {
      onSuccess: () => setShowAnular(false),
    });
  };

  const cambiarMargen = (productoId: number, margen: number) => {
    setMargenesEditados((prev) => {
      const nuevoMargen = Math.max(0, margen);
      const d = discrepancias?.find((x) => x.producto_id === productoId);
      if (d) {
        const nuevoPrecio = d.precio_unitario_orden * (1 + nuevoMargen / 100);
        setPreciosEditados((p) => ({ ...p, [productoId]: Math.round(nuevoPrecio * 100) / 100 }));
      }
      return { ...prev, [productoId]: nuevoMargen };
    });
  };

  const recibir = (actualizar?: boolean) => {
    setProcessing(true);

    const postData: Record<string, any> = {};

    if (actualizar && discrepancias && discrepancias.length > 0) {
      postData.actualizar_precios = discrepancias.map((d) => ({
        producto_id: d.producto_id,
        precio_compra: d.precio_unitario_orden,
        precio_venta: preciosEditados[d.producto_id] ?? d.nuevo_precio_venta_sugerido,
      }));
    }

    router.post(route('compras.recibir', orden.id), postData, {
      onFinish: () => {
        setProcessing(false);
        setShowRecibir(false);
        setDiscrepancias(null);
      },
    });
  };

  const fields = [
    { label: 'N° Comprobante', value: orden.numero_comprobante },
    { label: 'Proveedor', value: orden.proveedor?.nombre ?? '—' },
    { label: 'NIT/CI Proveedor', value: orden.proveedor?.nit_ci ?? '—' },
    { label: 'Tipo', value: orden.tipo_comprobante === 'factura' ? 'Factura' : 'Boleta' },
    { label: 'Fecha de Emisión', value: new Date(orden.fecha_emision).toLocaleString('es-BO') },
    { label: 'Estado', value: orden.estado === 'recibido' ? 'Recibido' : orden.estado === 'pendiente' ? 'Pendiente' : 'Anulado' },
    { label: 'Registrado por', value: orden.user?.name ?? '—' },
  ];

  return (
    <>
      <Head title={`Orden #${orden.numero_comprobante}`} />
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Orden #{orden.numero_comprobante}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {orden.estado === 'recibido' ? 'Orden recibida — stock actualizado' :
               orden.estado === 'pendiente' ? 'Orden pendiente de recepción' : 'Orden anulada'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={getReturnUrl(route('compras.index'))}
              className="shrink-0 px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-xs md:text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Volver
            </Link>
            {orden.estado === 'pendiente' && (
              <>
                <Link
                  href={route('compras.edit', orden.id)}
                  onClick={() => saveReturnUrl()}
                  className="shrink-0 px-3 py-1.5 md:px-4 md:py-2 rounded-lg bg-indigo-600 text-white text-xs md:text-sm hover:bg-indigo-700 transition-colors"
                >
                  Editar
                </Link>
                <button
                  onClick={abrirRecibir}
                  className="shrink-0 px-3 py-1.5 md:px-4 md:py-2 rounded-lg bg-emerald-600 text-white text-xs md:text-sm hover:bg-emerald-700 transition-colors"
                >
                  Recibir
                </button>
              </>
            )}
            <Link
              href={route('compras.create')}
              onClick={() => saveReturnUrl()}
              className="shrink-0 px-3 py-1.5 md:px-4 md:py-2 rounded-lg bg-emerald-600 text-white text-xs md:text-sm hover:bg-emerald-700 transition-colors"
            >
              + Nueva Orden
            </Link>
            {orden.estado === 'pendiente' && (
              <button
                onClick={() => setShowAnular(true)}
                className="shrink-0 px-3 py-1.5 md:px-4 md:py-2 rounded-lg bg-red-600 text-white text-xs md:text-sm hover:bg-red-700 transition-colors"
              >
                Anular
              </button>
            )}
          </div>
        </div>

        <Card>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Información de la Orden</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {fields.map(({ label, value }) => (
              <div key={label}>
                <dt className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</dt>
                <dd className="mt-0.5 text-sm text-slate-700 dark:text-slate-300">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Detalle de Productos</h2>
          {orden.estado === 'pendiente' && (
            <div className="mb-4 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <span>💡</span>
              <span>Al recibir la orden se verificará si el precio de compra difiere del registrado. Si es así, podrás ajustar el margen de utilidad y actualizar el precio de venta automáticamente.</span>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-slate-500 dark:text-slate-400 font-medium">Producto</th>
                  <th className="px-4 py-3 text-right text-slate-500 dark:text-slate-400 font-medium">P. Unitario</th>
                  <th className="px-4 py-3 text-right text-slate-500 dark:text-slate-400 font-medium">Cantidad</th>
                  <th className="px-4 py-3 text-right text-slate-500 dark:text-slate-400 font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {orden.detalle?.map((d: any) => (
                  <tr key={d.id}>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {d.producto?.codigo} — {d.producto?.nombre}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                      {currency(Number(d.precio_unitario))}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                      {Number(d.cantidad)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 font-medium">
                      {currency(Number(d.subtotal))}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-slate-200 dark:border-slate-700">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Subtotal
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {currency(Number(orden.subtotal))}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-4 py-1 text-right text-sm text-slate-500">
                    IGV (18%)
                  </td>
                  <td className="px-4 py-1 text-right text-sm text-slate-500">
                    {currency(Number(orden.igv))}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right text-base font-bold text-slate-900 dark:text-white">
                    Total
                  </td>
                  <td className="px-4 py-3 text-right text-base font-bold text-indigo-600 dark:text-indigo-400">
                    {currency(Number(orden.total))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

        {orden.observaciones && (
          <Card>
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Observaciones</h2>
            <p className="text-sm text-slate-700 dark:text-slate-300">{orden.observaciones}</p>
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={showAnular}
        onClose={() => setShowAnular(false)}
        onConfirm={anular}
        title="Confirmar anulación"
        message={`¿Estás seguro de anular la orden #${orden.numero_comprobante}? Esta acción no se puede deshacer.`}
      />

      <Modal show={showRecibir} onClose={() => { if (!processing) { setShowRecibir(false); setDiscrepancias(null); }}} maxWidth={discrepancias && discrepancias.length > 0 ? '2xl' : 'sm'}>
        <div className="p-6">
          {loadingDiscrepancias ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          ) : discrepancias && discrepancias.length > 0 ? (
            <>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                ⚠️ Precios diferentes detectados
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Los siguientes productos tienen un precio de compra distinto al registrado.
                El nuevo precio de venta se calcula con el margen de utilidad de cada producto.
              </p>
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-3 py-2 text-left text-slate-500 dark:text-slate-400 font-medium">Producto</th>
                      <th className="px-3 py-2 text-right text-slate-500 dark:text-slate-400 font-medium">P. Compra Actual</th>
                      <th className="px-3 py-2 text-right text-slate-500 dark:text-slate-400 font-medium">P. Compra Nuevo</th>
                      <th className="px-3 py-2 text-right text-slate-500 dark:text-slate-400 font-medium">P. Venta Actual</th>
                      <th className="px-3 py-2 text-right text-slate-500 dark:text-slate-400 font-medium">Margen %</th>
                      <th className="px-3 py-2 text-right text-slate-500 dark:text-slate-400 font-medium">Nuevo P. Venta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {discrepancias.map((d) => (
                      <tr key={d.producto_id}>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{d.producto_nombre}</td>
                        <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-300">{currency(d.precio_compra_actual)}</td>
                        <td className="px-3 py-2 text-right text-amber-600 font-semibold">{currency(d.precio_unitario_orden)}</td>
                        <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-300">{currency(d.precio_venta_actual)}</td>
                        <td className="px-3 py-2 text-right">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="999.99"
                            value={margenesEditados[d.producto_id] ?? d.margen_utilidad}
                            onChange={(e) => cambiarMargen(d.producto_id, parseFloat(e.target.value) || 0)}
                            className="w-16 text-right rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-3 py-2 text-right text-indigo-600 dark:text-indigo-400 font-semibold">
                          {currency(preciosEditados[d.producto_id] ?? d.nuevo_precio_venta_sugerido)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <PrimaryButton disabled={processing} onClick={() => recibir(true)}>
                  {processing ? 'Procesando...' : 'Recibir y Actualizar Precios'}
                </PrimaryButton>
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => recibir(false)}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  Recibir sin cambios
                </button>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Recibir Orden de Compra
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Al recibir la orden, se incrementará el stock de los productos automáticamente.
              </p>
              {discrepancias !== null && discrepancias.length === 0 && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-1">
                  ✓ Todos los precios de compra coinciden con los registrados.
                </p>
              )}
              <div className="flex justify-between items-center py-2 border-y border-slate-200 dark:border-slate-700 mb-4">
                <span className="text-sm text-slate-500 dark:text-slate-400">Total</span>
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {currency(Number(orden.total))}
                </span>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <PrimaryButton disabled={processing} onClick={() => recibir(false)}>
                  {processing ? 'Procesando...' : 'Confirmar Recepción'}
                </PrimaryButton>
                <button
                  type="button"
                  onClick={() => { setShowRecibir(false); setDiscrepancias(null); }}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}

Show.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
