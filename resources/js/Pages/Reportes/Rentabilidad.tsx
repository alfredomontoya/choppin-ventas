import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card } from '@/Components/ui/Card';
import { Pagination } from '@/Components/ui/Pagination';
import { TableHeader } from '@/Components/ui/TableHeader';
import { useState } from 'react';
import type { ReporteRentabilidad, ReporteRentabilidadResumen } from '@/types/models';

const columnas = [
  { key: 'codigo', label: 'Código' },
  { key: 'nombre', label: 'Producto' },
  { key: 'categoria', label: 'Categoría', render: (v: ReporteRentabilidad) => v.categoria || '—' },
  { key: 'cantidad_vendida', label: 'Cant.' },
  { key: 'precio_promedio', label: 'Precio Prom.', render: (v: ReporteRentabilidad) => `Bs ${v.precio_promedio.toLocaleString('es-BO', { minimumFractionDigits: 2 })}` },
  { key: 'ingreso_total', label: 'Ingreso', render: (v: ReporteRentabilidad) => `Bs ${v.ingreso_total.toLocaleString('es-BO', { minimumFractionDigits: 2 })}` },
  { key: 'costo_total', label: 'Costo', render: (v: ReporteRentabilidad) => `Bs ${v.costo_total.toLocaleString('es-BO', { minimumFractionDigits: 2 })}` },
  { key: 'ganancia_total', label: 'Ganancia', render: (v: ReporteRentabilidad) => `Bs ${v.ganancia_total.toLocaleString('es-BO', { minimumFractionDigits: 2 })}` },
  {
    key: 'margen', label: 'Margen', render: (v: ReporteRentabilidad) => (
      <span className={`font-semibold ${v.margen >= 30 ? 'text-emerald-600 dark:text-emerald-400' : v.margen >= 15 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
        {v.margen}%
      </span>
    ),
  },
];

interface Props {
  data: any;
  resumen: ReporteRentabilidadResumen;
  filtros: any;
}

export default function Rentabilidad({ data, resumen, filtros }: Props) {
  const [fechaDesde, setFechaDesde] = useState(filtros.fecha_desde ?? '');
  const [fechaHasta, setFechaHasta] = useState(filtros.fecha_hasta ?? '');
  const [search, setSearch] = useState(filtros.busqueda ?? '');

  const aplicarFiltros = () => {
    router.get(route('reportes.rentabilidad'), {
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
    router.get(route('reportes.rentabilidad'), {}, { preserveState: true, replace: true });
  };

  const ordenar = (columna: string) => {
    router.get(route('reportes.rentabilidad'), {
      ...filtros,
      orden: columna,
      direccion: filtros.orden === columna && filtros.direccion === 'asc' ? 'desc' : 'asc',
      busqueda: search,
      fecha_desde: fechaDesde || undefined,
      fecha_hasta: fechaHasta || undefined,
    }, { preserveState: true, replace: true });
  };

  const cambiarPagina = (params: Record<string, any>) => {
    router.get(route('reportes.rentabilidad'), {
      ...filtros, ...params,
      busqueda: search,
      fecha_desde: fechaDesde || undefined,
      fecha_hasta: fechaHasta || undefined,
    }, { preserveState: true, replace: true });
  };

  return (
    <>
      <Head title="Rentabilidad por Producto" />
      <div className="space-y-6">
        <div>
          <Link href={route('reportes.index')} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-2 inline-block">
            ← Volver a Reportes
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Rentabilidad por Producto</h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Productos Vendidos</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{resumen.total_productos_vendidos.toLocaleString('es-BO')}</p>
          </div>
          <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Productos Distintos</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{resumen.productos_distintos}</p>
          </div>
          <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Ingreso Total</p>
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">Bs {resumen.ingreso_total.toLocaleString('es-BO', { minimumFractionDigits: 2 })}</p>
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
            <table className="w-full text-sm min-w-[1000px]">
              <thead className="border-b border-slate-200 dark:border-slate-700">
                <tr>
                  {columnas.map((col) => (
                    <TableHeader key={col.key} label={col.label} sortKey={col.key}
                      currentSort={filtros.orden} currentDir={filtros.direccion} onSort={ordenar} />
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {data.data?.length === 0 ? (
                  <tr>
                    <td colSpan={columnas.length} className="px-4 py-12 text-center text-slate-400">No se encontraron productos.</td>
                  </tr>
                ) : (
                  data.data?.map((item: ReporteRentabilidad, idx: number) => (
                    <tr key={item.producto_id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap font-mono">{item.codigo}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.nombre}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.categoria || '—'}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 text-right">{item.cantidad_vendida.toLocaleString('es-BO')}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 text-right">Bs {item.precio_promedio.toLocaleString('es-BO', { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 text-right">Bs {item.ingreso_total.toLocaleString('es-BO', { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 text-right">Bs {item.costo_total.toLocaleString('es-BO', { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 text-right font-semibold">Bs {item.ganancia_total.toLocaleString('es-BO', { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-semibold ${item.margen >= 30 ? 'text-emerald-600 dark:text-emerald-400' : item.margen >= 15 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                          {item.margen}%
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

Rentabilidad.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
