import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card } from '@/Components/ui/Card';
import { Pagination } from '@/Components/ui/Pagination';
import { TableHeader } from '@/Components/ui/TableHeader';
import { useState } from 'react';
import type { ReporteVenta, ReporteVentasResumen } from '@/types/models';

const tiposPago = [
  { value: '', label: 'Todos' },
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'transferencia', label: 'Transferencia' },
];

const tiposComprobante = [
  { value: '', label: 'Todos' },
  { value: 'boleta', label: 'Boleta' },
  { value: 'factura', label: 'Factura' },
];

const columnas = [
  { key: 'fecha_emision', label: 'Fecha' },
  { key: 'numero_comprobante', label: 'Comprobante' },
  { key: 'tipo_comprobante', label: 'Tipo', render: (v: ReporteVenta) => v.tipo_comprobante === 'boleta' ? 'Boleta' : 'Factura' },
  { key: 'cliente', label: 'Cliente', render: (v: ReporteVenta) => v.cliente ? v.cliente.nombre : '—' },
  { key: 'tipo_pago', label: 'Pago', render: (v: ReporteVenta) => v.tipo_pago.charAt(0).toUpperCase() + v.tipo_pago.slice(1) },
  { key: 'subtotal', label: 'Subtotal', render: (v: ReporteVenta) => `Bs ${Number(v.subtotal).toLocaleString('es-BO', { minimumFractionDigits: 2 })}` },
  { key: 'iva', label: 'IVA', render: (v: ReporteVenta) => `Bs ${Number(v.iva).toLocaleString('es-BO', { minimumFractionDigits: 2 })}` },
  { key: 'descuento', label: 'Dto.', render: (v: ReporteVenta) => `Bs ${Number(v.descuento).toLocaleString('es-BO', { minimumFractionDigits: 2 })}` },
  { key: 'total', label: 'Total', render: (v: ReporteVenta) => `Bs ${Number(v.total).toLocaleString('es-BO', { minimumFractionDigits: 2 })}` },
];

interface Props {
  data: any;
  resumen: ReporteVentasResumen;
  filtros: any;
}

export default function Ventas({ data, resumen, filtros }: Props) {
  const [fechaDesde, setFechaDesde] = useState(filtros.fecha_desde ?? '');
  const [fechaHasta, setFechaHasta] = useState(filtros.fecha_hasta ?? '');
  const [tipoPago, setTipoPago] = useState(filtros.tipo_pago ?? '');
  const [tipoComprobante, setTipoComprobante] = useState(filtros.tipo_comprobante ?? '');

  const aplicarFiltros = () => {
    router.get(route('reportes.ventas'), {
      fecha_desde: fechaDesde || undefined,
      fecha_hasta: fechaHasta || undefined,
      tipo_pago: tipoPago || undefined,
      tipo_comprobante: tipoComprobante || undefined,
      page: 1,
    }, { preserveState: true, replace: true });
  };

  const limpiarFiltros = () => {
    setFechaDesde('');
    setFechaHasta('');
    setTipoPago('');
    setTipoComprobante('');
    router.get(route('reportes.ventas'), {}, { preserveState: true, replace: true });
  };

  const cambiarPagina = (params: Record<string, any>) => {
    router.get(route('reportes.ventas'), {
      ...filtros, ...params,
      fecha_desde: fechaDesde || undefined,
      fecha_hasta: fechaHasta || undefined,
      tipo_pago: tipoPago || undefined,
      tipo_comprobante: tipoComprobante || undefined,
    }, { preserveState: true, replace: true });
  };

  return (
    <>
      <Head title="Reporte de Ventas" />
      <div className="space-y-6">
        <div>
          <Link href={route('reportes.index')} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-2 inline-block">
            ← Volver a Reportes
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reporte de Ventas</h1>
        </div>

        {/* Resumen */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Ventas</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{resumen.total_ventas}</p>
          </div>
          <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Subtotal</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">Bs {resumen.subtotal.toLocaleString('es-BO', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">IVA</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">Bs {resumen.iva.toLocaleString('es-BO', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Descuento</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">Bs {resumen.descuento.toLocaleString('es-BO', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Total Ingresos</p>
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">Bs {resumen.total_ingresos.toLocaleString('es-BO', { minimumFractionDigits: 2 })}</p>
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
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Tipo Pago</label>
              <select value={tipoPago} onChange={(e) => setTipoPago(e.target.value)}
                className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {tiposPago.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Comprobante</label>
              <select value={tipoComprobante} onChange={(e) => setTipoComprobante(e.target.value)}
                className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {tiposComprobante.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button onClick={aplicarFiltros} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-colors">
                Buscar
              </button>
              <button onClick={limpiarFiltros} className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                Limpiar
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
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
                    <td colSpan={columnas.length} className="px-4 py-12 text-center text-slate-400">No se encontraron ventas.</td>
                  </tr>
                ) : (
                  data.data?.map((item: ReporteVenta) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {new Date(item.fecha_emision).toLocaleDateString('es-BO')}
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">{item.numero_comprobante}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.tipo_comprobante === 'boleta' ? 'Boleta' : 'Factura'}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.cliente ? item.cliente.nombre : '—'}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.tipo_pago.charAt(0).toUpperCase() + item.tipo_pago.slice(1)}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 text-right">Bs {Number(item.subtotal).toLocaleString('es-BO', { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 text-right">Bs {Number(item.iva).toLocaleString('es-BO', { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 text-right">Bs {Number(item.descuento).toLocaleString('es-BO', { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 text-right font-semibold">Bs {Number(item.total).toLocaleString('es-BO', { minimumFractionDigits: 2 })}</td>
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

Ventas.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
