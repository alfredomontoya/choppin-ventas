import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card } from '@/Components/ui/Card';
import { Pagination } from '@/Components/ui/Pagination';
import { TableHeader } from '@/Components/ui/TableHeader';
import { useState } from 'react';
import type { ReporteMovimiento, ReporteMovimientosResumen } from '@/types/models';

const tiposMovimiento = [
  { value: '', label: 'Todos' },
  { value: 'ingreso_compra', label: 'Ingreso por Compra' },
  { value: 'ingreso_manual', label: 'Ingreso Manual' },
  { value: 'ingreso_anulacion', label: 'Ingreso por Anulación' },
  { value: 'egreso_venta', label: 'Egreso por Venta' },
  { value: 'egreso_manual', label: 'Egreso Manual' },
  { value: 'ajuste', label: 'Ajuste' },
];

const labels: Record<string, string> = {
  ingreso_compra: 'Ingreso por Compra',
  ingreso_manual: 'Ingreso Manual',
  ingreso_anulacion: 'Ingreso por Anulación',
  egreso_venta: 'Egreso por Venta',
  egreso_manual: 'Egreso Manual',
  ajuste: 'Ajuste',
};

const columnas = [
  { key: 'created_at', label: 'Fecha' },
  { key: 'producto', label: 'Producto', render: (v: ReporteMovimiento) => v.producto?.nombre || '—' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'cantidad', label: 'Cantidad', render: (v: ReporteMovimiento) => Number(v.cantidad).toLocaleString('es-BO') },
  { key: 'stock_anterior', label: 'Stock Ant.', render: (v: ReporteMovimiento) => Number(v.stock_anterior).toLocaleString('es-BO') },
  { key: 'stock_posterior', label: 'Stock Post.', render: (v: ReporteMovimiento) => Number(v.stock_posterior).toLocaleString('es-BO') },
  { key: 'motivo', label: 'Motivo', render: (v: ReporteMovimiento) => v.motivo || '—' },
];

interface Props {
  data: any;
  resumen: ReporteMovimientosResumen;
  filtros: any;
}

export default function Movimientos({ data, resumen, filtros }: Props) {
  const [fechaDesde, setFechaDesde] = useState(filtros.fecha_desde ?? '');
  const [fechaHasta, setFechaHasta] = useState(filtros.fecha_hasta ?? '');
  const [tipo, setTipo] = useState(filtros.tipo ?? '');
  const [search, setSearch] = useState(filtros.producto ?? '');

  const aplicarFiltros = () => {
    router.get(route('reportes.movimientos'), {
      fecha_desde: fechaDesde || undefined,
      fecha_hasta: fechaHasta || undefined,
      tipo: tipo || undefined,
      producto: search || undefined,
      page: 1,
    }, { preserveState: true, replace: true });
  };

  const limpiarFiltros = () => {
    setFechaDesde('');
    setFechaHasta('');
    setTipo('');
    setSearch('');
    router.get(route('reportes.movimientos'), {}, { preserveState: true, replace: true });
  };

  const cambiarPagina = (params: Record<string, any>) => {
    router.get(route('reportes.movimientos'), {
      ...filtros, ...params,
      fecha_desde: fechaDesde || undefined,
      fecha_hasta: fechaHasta || undefined,
      tipo: tipo || undefined,
      producto: search || undefined,
    }, { preserveState: true, replace: true });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') aplicarFiltros();
  };

  return (
    <>
      <Head title="Movimientos de Stock" />
      <div className="space-y-6">
        <div>
          <Link href={route('reportes.index')} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-2 inline-block">
            ← Volver a Reportes
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Movimientos de Stock</h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Movimientos</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{resumen.total_movimientos}</p>
          </div>
          <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Ingresos</p>
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">{resumen.ingresos.toLocaleString('es-BO')}</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-xs text-red-600 dark:text-red-400 uppercase tracking-wide">Egresos</p>
            <p className="text-xl font-bold text-red-700 dark:text-red-300 mt-1">{resumen.egresos.toLocaleString('es-BO')}</p>
          </div>
        </div>

        <Card>
          <div className="flex flex-wrap gap-3 mb-4">
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Desde</label>
              <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)}
                className="rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Hasta</label>
              <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)}
                className="rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Tipo</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value)}
                className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {tiposMovimiento.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Producto</label>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={handleKeyDown} placeholder="Buscar producto..."
                className="rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="flex items-end gap-2">
              <button onClick={aplicarFiltros} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-colors">Buscar</button>
              <button onClick={limpiarFiltros} className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Limpiar</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="border-b border-slate-200 dark:border-slate-700">
                <tr>
                  {columnas.map((col) => (
                    <TableHeader key={col.key} label={col.key === 'tipo' ? 'Tipo' : col.label} sortKey={col.key} onSort={() => {}} />
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {data.data?.length === 0 ? (
                  <tr>
                    <td colSpan={columnas.length} className="px-4 py-12 text-center text-slate-400">No se encontraron movimientos.</td>
                  </tr>
                ) : (
                  data.data?.map((item: ReporteMovimiento) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {new Date(item.created_at).toLocaleDateString('es-BO')}
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.producto?.nombre || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.tipo.startsWith('ingreso') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          item.tipo.startsWith('egreso') ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {labels[item.tipo] || item.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 text-right">{Number(item.cantidad).toLocaleString('es-BO')}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 text-right">{Number(item.stock_anterior).toLocaleString('es-BO')}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 text-right">{Number(item.stock_posterior).toLocaleString('es-BO')}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.motivo || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination meta={data.meta ?? data} porPagina={filtros.por_pagina ?? 50} onChange={cambiarPagina} />
        </Card>
      </div>
    </>
  );
}

Movimientos.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
