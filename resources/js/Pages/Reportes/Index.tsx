import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';

const reportes = [
  {
    title: 'Ventas',
    description: 'Ingresos, impuestos y resumen de ventas por período.',
    icon: '🛒',
    route: 'reportes.ventas',
    color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  },
  {
    title: 'Compras',
    description: 'Gastos y resumen de órdenes de compra por período.',
    icon: '📦',
    route: 'reportes.compras',
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  },
  {
    title: 'Rentabilidad',
    description: 'Margen de ganancia por producto, costos e ingresos.',
    icon: '💰',
    route: 'reportes.rentabilidad',
    color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  },
  {
    title: 'Movimientos',
    description: 'Historial de entradas y salidas de stock.',
    icon: '🏭',
    route: 'reportes.movimientos',
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  },
  {
    title: 'Clientes',
    description: 'Clientes frecuentes, volumen de compras y fidelidad.',
    icon: '👥',
    route: 'reportes.clientes',
    color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
  },
];

export default function Index() {
  return (
    <>
      <Head title="Reportes" />
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Reportes</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          Selecciona un reporte para ver los datos detallados de tu negocio.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reportes.map((r) => (
            <Link
              key={r.route}
              href={route(r.route)}
              className="group block p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600 transition-all"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${r.color} mb-4`}>
                <span className="text-xl">{r.icon}</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {r.title}
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {r.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

Index.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
