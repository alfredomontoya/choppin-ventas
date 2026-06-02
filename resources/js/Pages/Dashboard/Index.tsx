import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card } from '@/Components/ui/Card';
import { StatCard } from '@/Components/ui/StatCard';
import { Badge } from '@/Components/ui/Badge';
import { DataTable } from '@/Components/ui/DataTable';
import type { DashboardResumen, Venta, Producto } from '@/types/models';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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
    render: (v: Venta) => `Bs ${Number(v.total).toFixed(2)}`,
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
        {v.estado === 'completado' ? 'Completado' : v.estado}
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

export default function DashboardIndex({ resumen }: { resumen: DashboardResumen }) {
  const data = resumen;

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
            trend={data.ventas_trend !== 0 ? { value: Math.abs(data.ventas_trend), isUp: data.ventas_trend > 0 } : undefined}
          />
          <StatCard
            title="Ingresos Hoy"
            value={`Bs ${data.ingresos_hoy.toFixed(2)}`}
            variant="success"
            trend={data.ingresos_trend !== 0 ? { value: Math.abs(data.ingresos_trend), isUp: data.ingresos_trend > 0 } : undefined}
          />
          <StatCard
            title="Productos Agotados"
            value={data.productos_agotados}
            variant="warning"
          />
          <StatCard
            title="Órdenes Pendientes"
            value={data.ordenes_pendientes}
            variant="default"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Ingresos Semanales">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.ingresos_semana} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                  <XAxis dataKey="fecha" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value) => [`Bs ${Number(value).toFixed(2)}`, 'Ingresos']}
                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Alertas de Stock">
            <div className="space-y-3">
              {data.stock_bajo.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No hay productos con stock bajo</p>
              ) : (
                data.stock_bajo.map((p) => (
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
                ))
              )}
            </div>
          </Card>
        </div>

        <Card title="Últimas Ventas">
          {data.ventas_recientes.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No hay ventas registradas</p>
          ) : (
            <DataTable
              columns={ventaColumns}
              data={data.ventas_recientes}
              keyExtractor={(v: Venta) => v.id}
            />
          )}
        </Card>
      </div>
    </>
  );
}

DashboardIndex.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
