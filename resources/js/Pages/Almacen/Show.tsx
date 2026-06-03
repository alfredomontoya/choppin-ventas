import { Head, Link, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card } from '@/Components/ui/Card';
import { getReturnUrl, saveReturnUrl } from '@/lib/navigation';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const tipoLabel: Record<string, string> = {
  ingreso_compra: 'Ingreso por Compra',
  ingreso_manual: 'Ingreso Manual',
  ingreso_anulacion: 'Ingreso por Anulación',
  egreso_venta: 'Egreso por Venta',
  egreso_manual: 'Egreso Manual',
  ajuste: 'Ajuste',
};

const tipoColor: Record<string, string> = {
  ingreso_compra: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20',
  ingreso_manual: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20',
  ingreso_anulacion: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20',
  egreso_venta: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20',
  egreso_manual: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20',
  ajuste: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20',
};

export default function Show({ movimiento }: { movimiento: any }) {
  const { flash } = usePage().props as any;

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  const goBack = () => {
    router.visit(getReturnUrl(route('almacen.index')));
  };

  const fields = [
    { label: 'Producto', value: movimiento.producto?.nombre ?? '—' },
    { label: 'Código', value: movimiento.producto?.codigo ?? '—' },
    {
      label: 'Tipo',
      value: (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${tipoColor[movimiento.tipo] || ''}`}>
          {tipoLabel[movimiento.tipo] || movimiento.tipo}
        </span>
      ),
    },
    { label: 'Cantidad', value: movimiento.cantidad },
    { label: 'Stock Anterior', value: movimiento.stock_anterior },
    { label: 'Stock Posterior', value: movimiento.stock_posterior },
    { label: 'Usuario', value: movimiento.user?.name ?? '—' },
    { label: 'Motivo', value: movimiento.motivo || '—' },
    { label: 'Fecha', value: movimiento.created_at ? new Date(movimiento.created_at).toLocaleString('es-BO') : '—' },
  ];

  return (
    <>
      <Head title="Movimiento de Almacén" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Movimiento #{movimiento.id}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Detalle del movimiento de almacén</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={goBack}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Volver
            </button>
            <Link
              href={route('almacen.create')}
              onClick={() => saveReturnUrl()}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
            >
              + Nuevo Movimiento
            </Link>
          </div>
        </div>

        <Card>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {fields.map(({ label, value }) => (
              <div key={label}>
                <dt className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</dt>
                <dd className="mt-0.5 text-sm text-slate-700 dark:text-slate-300">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        {movimiento.referencia && (
          <Card title="Documento Origen">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {movimiento.referencia_type === 'App\\Models\\Venta' ? 'Venta' :
               movimiento.referencia_type === 'App\\Models\\OrdenCompra' ? 'Orden de Compra' : 'Documento'} #{movimiento.referencia_id}
            </p>
          </Card>
        )}
      </div>
    </>
  );
}

Show.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
