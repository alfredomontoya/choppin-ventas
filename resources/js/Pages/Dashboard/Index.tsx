import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card } from '@/Components/ui/Card';
import { StatCard } from '@/Components/ui/StatCard';
import { Badge } from '@/Components/ui/Badge';
import { DataTable } from '@/Components/ui/DataTable';
import { getDashboardResumen } from '@/services/mock/dashboardMock';
import type { Venta, Producto } from '@/types/models';

const data = getDashboardResumen();

const ventaColumns = [
  { key: 'numero_comprobante', header: 'Comprobante' },
  {
    key: 'cliente',
    header: 'Cliente',
    render: (v: Venta) => v.cliente ? `${v.cliente.nombre} ${v.cliente.apellido}` : '—',
  },
  {
    key: 'total',
    header: 'Total',
    render: (v: Venta) => `S/ ${v.total.toFixed(2)}`,
  },
  {
    key: 'tipo_pago',
    header: 'Pago',
  },
  {
    key: 'estado',
    header: 'Estado',
    render: (v: Venta) => (
      <Badge variant={v.estado === 'completado' ? 'success' : 'danger'}>
        {v.estado}
      </Badge>
    ),
  },
];

const stockColumns = [
  { key: 'codigo', header: 'Código' },
  { key: 'nombre', header: 'Producto' },
  {
    key: 'stock_actual',
    header: 'Stock',
    render: (p: Producto) => (
      <span className={p.stock_actual <= 0 ? 'text-red-600 font-semibold' : 'text-amber-600 font-semibold'}>
        {p.stock_actual} {p.unidad_medida}
      </span>
    ),
  },
  {
    key: 'stock_minimo',
    header: 'Stock Mínimo',
    render: (p: Producto) => `${p.stock_minimo} ${p.unidad_medida}`,
  },
];

function DashboardIndex() {
  return (
    <>
      <Head title="Dashboard" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Resumen del día de hoy
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Ventas Hoy"
            value={data.ventas_hoy}
            variant="primary"
            trend={{ value: 12, isUp: true }}
          />
          <StatCard
            title="Ingresos Hoy"
            value={`S/ ${data.ingresos_hoy.toFixed(2)}`}
            variant="success"
            trend={{ value: 8, isUp: true }}
          />
          <StatCard
            title="Productos Agotados"
            value={data.productos_agotados}
            variant="warning"
            trend={{ value: 2, isUp: false }}
          />
          <StatCard
            title="Órdenes Pendientes"
            value={data.ordenes_pendientes}
            variant="default"
            trend={{ value: 0, isUp: false }}
          />
        </div>

        {/* Feature Cards */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Módulos del Sistema
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center text-white text-lg">◻</div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Choppín</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Sistema de ventas integral para gestionar tu negocio de forma sencilla y eficiente.
                Controla productos, clientes, proveedores y almacén en un solo lugar.
              </p>
            </div>

            <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center text-white text-lg">🛒</div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Ventas</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Registra y administra todas tus ventas de forma ágil. Genera comprobantes,
                consulta el historial y lleva el control de pagos al instante.
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center text-white text-lg">🏭</div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Almacén</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Gestiona el inventario con total precisión. Controla entradas y salidas,
                establece stocks mínimos y recibe alertas automáticas.
              </p>
            </div>

            <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white text-lg">📊</div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Reportes</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Obtén reportes detallados sobre el rendimiento de tu negocio. Analiza ingresos,
                productos más vendidos y tendencias.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Ingresos Semanales">
            <div className="h-48 flex items-end gap-3">
              {data.ingresos_semana.map((item) => {
                const max = Math.max(...data.ingresos_semana.map((i) => i.total));
                const height = (item.total / max) * 100;
                return (
                  <div key={item.fecha} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-slate-500">S/{item.total}</span>
                    <div
                      className="w-full bg-indigo-500 rounded-t-md transition-all hover:bg-indigo-600"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-slate-400 truncate w-full text-center">{item.fecha}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="Alertas de Stock">
            <div className="space-y-3">
              {data.stock_bajo.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800"
                >
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{p.nombre}</p>
                    <p className="text-xs text-slate-500">{p.codigo}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${p.stock_actual <= 0 ? 'text-red-600' : 'text-amber-600'}`}>
                      {p.stock_actual} {p.unidad_medida}
                    </p>
                    <p className="text-xs text-slate-400">Mín: {p.stock_minimo}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card title="Últimas Ventas">
          <DataTable
            columns={ventaColumns}
            data={data.ventas_recientes}
            keyExtractor={(v) => v.id}
          />
        </Card>
      </div>
    </>
  );
}

DashboardIndex.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default DashboardIndex;
