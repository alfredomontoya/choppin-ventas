import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card } from '@/Components/ui/Card';
import { Pagination } from '@/Components/ui/Pagination';
import { TableHeader } from '@/Components/ui/TableHeader';
import { useState } from 'react';
import type { ReporteCompra, ReporteComprasResumen } from '@/types/models';

const estados = [
  { value: '', label: 'Todos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'recibido', label: 'Recibido' },
  { value: 'anulado', label: 'Anulado' },
];

const columnas = [
  { key: 'fecha_emision', label: 'Fecha' },
  { key: 'numero_comprobante', label: 'Comprobante' },
  { key: 'proveedor', label: 'Proveedor', render: (v: ReporteCompra) => v.proveedor?.nombre || '—' },
  { key: 'subtotal', label: 'Subtotal', render: (v: ReporteCompra) => `Bs ${Number(v.subtotal).toLocaleString('es-BO', { minimumFractionDigits: 2 })}` },
  { key: 'igv', label: 'IGV', render: (v: ReporteCompra) => `Bs ${Number(v.igv).toLocaleString('es-BO', { minimumFractionDigits: 2 })}` },
  { key: 'total', label: 'Total', render: (v: ReporteCompra) => `Bs ${Number(v.total).toLocaleString('es-BO', { minimumFractionDigits: 2 })}` },
  {
    key: 'estado', label: 'Estado', render: (v: ReporteCompra) => {
      const colors: Record<string, string> = {
        pendiente: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        recibido: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        anulado: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      };
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[v.estado] || ''}`}>
          {v.estado.charAt(0).toUpperCase() + v.estado.slice(1)}
        </span>
      );
    },
  },
];

interface Props {
  data: any;
  resumen: ReporteComprasResumen;
  filtros: any;
}

export default function Compras({ data, resumen, filtros }: Props) {
  const [fechaDesde, setFechaDesde] = useState(filtros.fecha_desde ?? '');
  const [fechaHasta, setFechaHasta] = useState(filtros.fecha_hasta ?? '');
  const [estado, setEstado] = useState(filtros.estado ?? '');

  const aplicarFiltros = () => {
    router.get(route('reportes.compras'), {
      fecha_desde: fechaDesde || undefined,
      fecha_hasta: fechaHasta || undefined,
      estado: estado || undefined,
      page: 1,
    }, { preserveState: true, replace: true });
  };

  const limpiarFiltros = () => {
    setFechaDesde('');
    setFechaHasta('');
    setEstado('');
    router.get(route('reportes.compras'), {}, { preserveState: true, replace: true });
  };

  const cambiarPagina = (params: Record<string, any>) => {
    router.get(route('reportes.compras'), {
      ...filtros, ...params,
      fecha_desde: fechaDesde || undefined,
      fecha_hasta: fechaHasta || undefined,
      estado: estado || undefined,
    }, { preserveState: true, replace: true });
  };

  return (
    <>
      <Head title="Reporte de Compras" />
      <div className="space-y-6">
        <div>
          <Link href={route('reportes.index')} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-2 inline-block">
            ← Volver a Reportes
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reporte de Compras</h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Compras</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{resumen.total_compras}</p>
          </div>
          <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Subtotal</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">Bs {resumen.subtotal.toLocaleString('es-BO', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">IGV</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">Bs {resumen.igv.toLocaleString('es-BO', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wide">Total Gastos</p>
            <p className="text-xl font-bold text-amber-700 dark:text-amber-300 mt-1">Bs {resumen.total_gastos.toLocaleString('es-BO', { minimumFractionDigits: 2 })}</p>
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
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Estado</label>
              <select value={estado} onChange={(e) => setEstado(e.target.value)}
                className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {estados.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button onClick={aplicarFiltros} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-colors">Buscar</button>
              <button onClick={limpiarFiltros} className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Limpiar</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead className="border-b border-slate-200 dark:border-slate-700">
                <tr>
                  {columnas.map((col) => (
                    <TableHeader key={col.key} label={col.label} sortKey={col.key} onSort={() => {}} />
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {data.data?.length === 0 ? (
                  <tr>
                    <td colSpan={columnas.length} className="px-4 py-12 text-center text-slate-400">No se encontraron compras.</td>
                  </tr>
                ) : (
                  data.data?.map((item: ReporteCompra) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {new Date(item.fecha_emision).toLocaleDateString('es-BO')}
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">{item.numero_comprobante}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.proveedor?.nombre || '—'}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 text-right">Bs {Number(item.subtotal).toLocaleString('es-BO', { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 text-right">Bs {Number(item.igv).toLocaleString('es-BO', { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 text-right font-semibold">Bs {Number(item.total).toLocaleString('es-BO', { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.estado === 'recibido' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          item.estado === 'pendiente' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {item.estado.charAt(0).toUpperCase() + item.estado.slice(1)}
                        </span>
                      </td>
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

Compras.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
