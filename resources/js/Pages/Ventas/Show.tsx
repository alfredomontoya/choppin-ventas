import { Head, Link, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card } from '@/Components/ui/Card';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

const currency = (n: number) => {
  if (n == null || isNaN(n)) return 'Bs 0.00';
  return `Bs ${Number(n).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function Show({ venta, url_anterior }: { venta: any; url_anterior?: string }) {
  const { flash } = usePage().props as any;

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  const imprimir = () => {
    const url = route('ventas.imprimir', [venta.id, { tipo: 'nota' }]);
    window.open(url, '_blank', 'width=400,height=700');
  };

  const fields = [
    { label: 'N° Comprobante', value: venta.numero_comprobante },
    { label: 'Tipo', value: venta.tipo_comprobante === 'boleta' ? 'Boleta' : 'Factura' },
    { label: 'Fecha de Emisión', value: new Date(venta.fecha_emision).toLocaleString('es-BO') },
    { label: 'Cliente', value: venta.cliente ? `${venta.cliente.nombre} ${venta.cliente.apellido}` : '—' },
    { label: 'Documento Cliente', value: venta.cliente?.numero_documento ?? '—' },
    { label: 'Tipo de Pago', value: venta.tipo_pago.charAt(0).toUpperCase() + venta.tipo_pago.slice(1) },
    { label: 'Estado', value: venta.estado === 'completado' ? 'Completado' : 'Anulado' },
    { label: 'Atendido por', value: venta.user?.name ?? '—' },
  ];

  return (
    <>
      <Head title={`Venta #${venta.numero_comprobante}`} />
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Venta #{venta.numero_comprobante}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {venta.estado === 'completado' ? 'Venta completada' : 'Venta anulada'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={url_anterior ?? route('ventas.index')}
              className="shrink-0 px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-xs md:text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Volver
            </Link>
            {venta.estado === 'completado' && (
              <button
                onClick={imprimir}
                className="shrink-0 px-3 py-1.5 md:px-4 md:py-2 rounded-lg bg-sky-600 text-white text-xs md:text-sm hover:bg-sky-700 transition-colors"
              >
                🖨️ Imprimir comprobante
              </button>
            )}
          </div>
        </div>

        <Card>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Información de la Venta</h2>
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
                {venta.detalle?.map((d: any) => (
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
                    {currency(Number(venta.subtotal))}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-4 py-1 text-right text-sm text-slate-500">
                    Descuento
                  </td>
                  <td className="px-4 py-1 text-right text-sm text-red-500">
                    -{currency(Number(venta.descuento))}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right text-base font-bold text-slate-900 dark:text-white">
                    Total
                  </td>
                  <td className="px-4 py-3 text-right text-base font-bold text-indigo-600 dark:text-indigo-400">
                    {currency(Number(venta.total))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

        {venta.observaciones && (
          <Card>
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Observaciones</h2>
            <p className="text-sm text-slate-700 dark:text-slate-300">{venta.observaciones}</p>
          </Card>
        )}
      </div>

    </>
  );
}

Show.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
