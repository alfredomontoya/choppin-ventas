import { Head, Link, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card } from '@/Components/ui/Card';
import { Pagination } from '@/Components/ui/Pagination';
import { TableHeader } from '@/Components/ui/TableHeader';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { TipoMovimientoStock } from '@/types/enums';

const tipoLabel: Record<string, string> = {
  ingreso_compra: 'Ingreso x Compra',
  ingreso_manual: 'Ingreso Manual',
  ingreso_anulacion: 'Ingreso x Anulación',
  egreso_venta: 'Egreso x Venta',
  egreso_manual: 'Egreso Manual',
  ajuste: 'Ajuste',
};

const tipoColor: Record<string, string> = {
  ingreso_compra: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  ingreso_manual: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  ingreso_anulacion: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  egreso_venta: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  egreso_manual: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  ajuste: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const columnas = [
  { key: 'id', label: '#' },
  {
    key: 'producto',
    label: 'Producto',
    render: (m: any) => m.producto ? `${m.producto.nombre} (${m.producto.codigo})` : '—',
  },
  {
    key: 'tipo',
    label: 'Tipo',
    render: (m: any) => (
      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${tipoColor[m.tipo] || ''}`}>
        {tipoLabel[m.tipo] || m.tipo}
      </span>
    ),
  },
  { key: 'cantidad', label: 'Cantidad' },
  { key: 'stock_anterior', label: 'Stock Anterior' },
  { key: 'stock_posterior', label: 'Stock Posterior' },
  {
    key: 'user',
    label: 'Usuario',
    render: (m: any) => m.user?.name ?? '—',
  },
  {
    key: 'motivo',
    label: 'Motivo',
    render: (m: any) => m.motivo || '—',
  },
  {
    key: 'created_at',
    label: 'Fecha',
    render: (m: any) => m.created_at ? new Date(m.created_at).toLocaleString('es-BO') : '—',
  },
];

export default function Index({ movimientos, filtros }: { movimientos: any; filtros: any }) {
  const { flash } = usePage().props as any;
  const [search, setSearch] = useState<string>(filtros.busqueda ?? '');
  const [tipo, setTipo] = useState<string>(filtros.tipo ?? '');
  const [fechaDesde, setFechaDesde] = useState<string>(filtros.fecha_desde ?? '');
  const [fechaHasta, setFechaHasta] = useState<string>(filtros.fecha_hasta ?? '');

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  const aplicarFiltros = () => {
    router.get(route('almacen.index'), {
      busqueda: search || undefined,
      tipo: tipo || undefined,
      fecha_desde: fechaDesde || undefined,
      fecha_hasta: fechaHasta || undefined,
      page: 1,
    }, { preserveState: true, replace: true });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      aplicarFiltros();
    }
  };

  const limpiarFiltros = () => {
    setSearch('');
    setTipo('');
    setFechaDesde('');
    setFechaHasta('');
    router.get(route('almacen.index'), {}, { preserveState: true, replace: true });
  };

  const ordenar = (columna: string) => {
    router.get(route('almacen.index'), {
      ...filtros,
      orden: columna,
      direccion: filtros.orden === columna && filtros.direccion === 'asc' ? 'desc' : 'asc',
      busqueda: search,
      tipo: tipo || undefined,
      fecha_desde: fechaDesde || undefined,
      fecha_hasta: fechaHasta || undefined,
    }, { preserveState: true, replace: true });
  };

  const cambiarPagina = (params: Record<string, any>) => {
    router.get(route('almacen.index'), {
      ...filtros,
      ...params,
      busqueda: search,
      tipo: tipo || undefined,
      fecha_desde: fechaDesde || undefined,
      fecha_hasta: fechaHasta || undefined,
    }, { preserveState: true, replace: true });
  };

  const resultados = movimientos.total ?? 0;
  const filtrosActivos = search !== '' || tipo !== '' || fechaDesde !== '' || fechaHasta !== '';

  return (
    <>
      <Head title="Almacén" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Almacén</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {filtrosActivos
                ? `Se encontraron ${resultados} ${resultados === 1 ? 'coincidencia' : 'coincidencias'}`
                : `${resultados} ${resultados === 1 ? 'movimiento' : 'movimientos'} en total`
              }
            </p>
          </div>
          <Link
            href={route('almacen.create', { return_url: window.location.href })}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            + Nuevo Movimiento
          </Link>
        </div>

        <Card>
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <input
                type="text"
                placeholder="Buscar por producto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch('');
                    router.get(route('almacen.index'), { ...filtros, busqueda: undefined }, { preserveState: true });
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todos los tipos</option>
              <option value="ingreso_manual">Ingreso Manual</option>
              <option value="egreso_manual">Egreso Manual</option>
              <option value="ajuste">Ajuste</option>
              <option value="ingreso_compra">Ingreso por Compra</option>
              <option value="egreso_venta">Egreso por Venta</option>
              <option value="ingreso_anulacion">Ingreso por Anulación</option>
            </select>

            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Desde"
              title="Fecha desde"
            />

            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Hasta"
              title="Fecha hasta"
            />

            <button type="button" onClick={aplicarFiltros} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-colors">
              Buscar
            </button>
            <button onClick={limpiarFiltros} className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              Limpiar
            </button>
            <button
              onClick={() => { window.location.href = route('almacen.exportar', filtros); }}
              className="px-4 py-2 rounded-lg border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
            >
              Exportar Excel
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="border-b border-slate-200 dark:border-slate-700">
                <tr>
                  {columnas.map((col) => (
                    <TableHeader
                      key={col.key}
                      label={col.label}
                      sortKey={col.key}
                      currentSort={filtros.orden}
                      currentDir={filtros.direccion}
                      onSort={ordenar}
                    />
                  ))}
                  <th className="px-4 py-3 text-right text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {movimientos.data?.length === 0 ? (
                  <tr>
                    <td colSpan={columnas.length + 1} className="px-4 py-12 text-center text-slate-400">
                      No se encontraron movimientos.
                    </td>
                  </tr>
                ) : (
                  movimientos.data?.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      {columnas.map((col) => (
                        <td key={col.key} className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap lg:whitespace-normal">
                          {col.render ? col.render(item) : item[col.key] ?? '—'}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={route('almacen.show', [item.id, { url_anterior: window.location.href }])}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          title="Ver"
                        >
                          👁
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            meta={movimientos.meta ?? movimientos}
            porPagina={filtros.por_pagina ?? 10}
            onChange={cambiarPagina}
          />
        </Card>
      </div>
    </>
  );
}

Index.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
