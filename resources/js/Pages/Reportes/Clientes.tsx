import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card } from '@/Components/ui/Card';
import { Pagination } from '@/Components/ui/Pagination';
import { TableHeader } from '@/Components/ui/TableHeader';
import { useState } from 'react';
import type { ReporteCliente, ReporteClientesResumen } from '@/types/models';

const columnas = [
  { key: 'nombre_completo', label: 'Cliente' },
  { key: 'numero_documento', label: 'Documento', render: (v: ReporteCliente) => v.numero_documento || '—' },
  { key: 'total_compras', label: 'Compras' },
  { key: 'monto_total', label: 'Monto Total', render: (v: ReporteCliente) => `Bs ${v.monto_total.toLocaleString('es-BO', { minimumFractionDigits: 2 })}` },
  { key: 'promedio_compra', label: 'Promedio', render: (v: ReporteCliente) => `Bs ${v.promedio_compra.toLocaleString('es-BO', { minimumFractionDigits: 2 })}` },
  { key: 'ultima_compra', label: 'Última Compra', render: (v: ReporteCliente) => v.ultima_compra ? new Date(v.ultima_compra).toLocaleDateString('es-BO') : '—' },
];

interface Props {
  data: any;
  resumen: ReporteClientesResumen;
  filtros: any;
}

export default function Clientes({ data, resumen, filtros }: Props) {
  const [fechaDesde, setFechaDesde] = useState(filtros.fecha_desde ?? '');
  const [fechaHasta, setFechaHasta] = useState(filtros.fecha_hasta ?? '');
  const [search, setSearch] = useState(filtros.busqueda ?? '');

  const aplicarFiltros = () => {
    router.get(route('reportes.clientes'), {
      fecha_desde: fechaDesde || undefined,
      fecha_hasta: fechaHasta || undefined,
      busqueda: search || undefined,
      page: 1,
    }, { preserveState: true, replace: true });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') aplicarFiltros();
  };

  const limpiarFiltros = () => {
    setFechaDesde('');
    setFechaHasta('');
    setSearch('');
    router.get(route('reportes.clientes'), {}, { preserveState: true, replace: true });
  };

  const ordenar = (columna: string) => {
    router.get(route('reportes.clientes'), {
      ...filtros,
      orden: columna,
      direccion: filtros.orden === columna && filtros.direccion === 'asc' ? 'desc' : 'asc',
      busqueda: search,
      fecha_desde: fechaDesde || undefined,
      fecha_hasta: fechaHasta || undefined,
    }, { preserveState: true, replace: true });
  };

  const cambiarPagina = (params: Record<string, any>) => {
    router.get(route('reportes.clientes'), {
      ...filtros, ...params,
      busqueda: search,
      fecha_desde: fechaDesde || undefined,
      fecha_hasta: fechaHasta || undefined,
    }, { preserveState: true, replace: true });
  };

  return (
    <>
      <Head title="Clientes Frecuentes" />
      <div className="space-y-6">
        <div>
          <Link href={route('reportes.index')} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-2 inline-block">
            ← Volver a Reportes
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Clientes Frecuentes</h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Clientes con Compras</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{resumen.total_clientes}</p>
          </div>
          <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Ingresos Generados</p>
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">Bs {resumen.total_ingresos.toLocaleString('es-BO', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Promedio por Cliente</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">Bs {resumen.promedio_general.toLocaleString('es-BO', { minimumFractionDigits: 2 })}</p>
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
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Cliente</label>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={handleKeyDown} placeholder="Buscar cliente..."
                className="rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
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
                    <TableHeader key={col.key} label={col.key === 'nombre_completo' ? 'Cliente' : col.label} sortKey={col.key}
                      currentSort={filtros.orden} currentDir={filtros.direccion} onSort={ordenar} />
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {data.data?.length === 0 ? (
                  <tr>
                    <td colSpan={columnas.length} className="px-4 py-12 text-center text-slate-400">No se encontraron clientes.</td>
                  </tr>
                ) : (
                  data.data?.map((item: ReporteCliente) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">{item.nombre_completo}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-mono text-xs">{item.numero_documento || '—'}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 text-right">{item.total_compras}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 text-right">Bs {item.monto_total.toLocaleString('es-BO', { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 text-right">Bs {item.promedio_compra.toLocaleString('es-BO', { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {item.ultima_compra ? new Date(item.ultima_compra).toLocaleDateString('es-BO') : '—'}
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

Clientes.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
