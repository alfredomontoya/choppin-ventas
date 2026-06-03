import { Head, Link, router, usePage } from '@inertiajs/react';
import { saveReturnUrl } from '@/lib/navigation';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card } from '@/Components/ui/Card';
import { Pagination } from '@/Components/ui/Pagination';
import { TableHeader } from '@/Components/ui/TableHeader';
import { ConfirmDialog } from '@/Components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import HighlightText from '@/Components/ui/HighlightText';

const columnas = [
  { key: 'numero_comprobante', label: 'Comprobante' },
  { key: 'tipo_comprobante', label: 'Tipo', render: (v: any) => v.tipo_comprobante === 'boleta' ? 'Boleta' : 'Factura' },
  { key: 'cliente', label: 'Cliente', render: (v: any) => v.cliente ? v.cliente.nombre : '—' },
  { key: 'fecha_emision', label: 'Fecha', render: (v: any) => new Date(v.fecha_emision).toLocaleDateString('es-BO') },
  { key: 'total', label: 'Total', render: (v: any) => `Bs ${Number(v.total).toLocaleString('es-BO', { minimumFractionDigits: 2 })}` },
  { key: 'tipo_pago', label: 'Pago', render: (v: any) => v.tipo_pago.charAt(0).toUpperCase() + v.tipo_pago.slice(1) },
  { key: 'estado', label: 'Estado', render: (v: any) => (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
      v.estado === 'completado' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
      v.estado === 'anulado' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
    }`}>
      {v.estado === 'completado' ? 'Completado' : 'Anulado'}
    </span>
  )},
];

export default function Index({ ventas, filtros }: { ventas: any; filtros: any }) {
  const { flash } = usePage().props as any;
  const [search, setSearch] = useState<string>(filtros.busqueda ?? '');
  const [anularId, setAnularId] = useState<number | null>(null);
  const [exportando, setExportando] = useState(false);

  const porPaginaDefault = filtros.por_pagina ?? 10;

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  const aplicarFiltros = () => {
    router.get(route('ventas.index'), {
      ...filtros,
      busqueda: search || undefined,
      page: 1,
    }, { preserveState: true, replace: true });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') aplicarFiltros();
  };

  const limpiarFiltros = () => {
    setSearch('');
    router.get(route('ventas.index'), {}, { preserveState: true, replace: true });
  };

  const ordenar = (columna: string) => {
    router.get(route('ventas.index'), {
      ...filtros,
      orden: columna,
      direccion: filtros.orden === columna && filtros.direccion === 'asc' ? 'desc' : 'asc',
      busqueda: search,
    }, { preserveState: true, replace: true });
  };

  const cambiarPagina = (params: Record<string, any>) => {
    router.get(route('ventas.index'), { ...filtros, ...params, busqueda: search }, { preserveState: true, replace: true });
  };

  const imprimir = (id: number, tipo: 'nota' | 'factura') => {
    const url = route('ventas.imprimir', [id, { tipo }]);
    window.open(url, '_blank', 'width=400,height=700');
  };

  const confirmarAnular = (id: number) => setAnularId(id);

  const anular = () => {
    if (!anularId) return;
    router.delete(route('ventas.destroy', anularId), {
      onSuccess: () => setAnularId(null),
    });
  };

  const resultados = ventas.total ?? 0;
  const filtrosActivos = search !== '';

  return (
    <>
      <Head title="Ventas" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Ventas</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {filtrosActivos
                ? `Se encontraron ${resultados} ${resultados === 1 ? 'coincidencia' : 'coincidencias'}`
                : `${resultados} ${resultados === 1 ? 'registro' : 'registros'} en total`
              }
            </p>
          </div>
          <Link
            href={route('ventas.create')}
            onClick={() => saveReturnUrl()}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            + Nueva Venta
          </Link>
        </div>

        <Card>
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <input
                type="text"
                placeholder="Buscar por comprobante..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch('');
                    router.get(route('ventas.index'), { ...filtros, busqueda: undefined }, { preserveState: true });
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
            <button onClick={aplicarFiltros} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-colors">
              Buscar
            </button>
            <button onClick={limpiarFiltros} className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              Limpiar
            </button>
            <button
              onClick={() => {
                setExportando(true);
                toast.loading('Exportando ventas...', { id: 'export' });
                window.location.href = route('ventas.exportar', filtros);
                setTimeout(() => {
                  setExportando(false);
                  toast.dismiss('export');
                  toast.success('Exportación completada.');
                }, 3000);
              }}
              disabled={exportando}
              className="px-4 py-2 rounded-lg border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 text-sm hover:bg-emerald-50 dark:hover:bg-emerald-700/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exportando ? 'Exportando...' : 'Exportar Excel'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
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
                  <th className="px-4 py-3 text-right text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap lg:whitespace-normal">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {ventas.data?.length === 0 ? (
                  <tr>
                    <td colSpan={columnas.length + 1} className="px-4 py-12 text-center text-slate-400">
                      No se encontraron ventas.
                    </td>
                  </tr>
                ) : (
                  ventas.data?.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      {columnas.map((col) => (
                        <td key={col.key} className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap lg:whitespace-normal">
                          {filtros.busqueda
                            ? <HighlightText text={col.render ? String(col.render(item)) : String(item[col.key] ?? '')} query={filtros.busqueda} />
                            : (col.render ? col.render(item) : item[col.key])
                          }
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={route('ventas.show', item.id)} onClick={() => saveReturnUrl()} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Ver">
                            👁
                          </Link>
                          {item.estado === 'completado' && (
                            <>
                              <button onClick={() => imprimir(item.id, 'nota')} className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Imprimir Nota">
                                🧾
                              </button>
                              <button onClick={() => imprimir(item.id, 'factura')} className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Imprimir Factura">
                                🖨️
                              </button>
                              <button onClick={() => confirmarAnular(item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Anular">
                                🚫
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            meta={ventas.meta ?? ventas}
            porPagina={filtros.por_pagina ?? porPaginaDefault}
            onChange={cambiarPagina}
          />
        </Card>
      </div>

      <ConfirmDialog
        open={anularId !== null}
        onClose={() => setAnularId(null)}
        onConfirm={anular}
        title="Confirmar anulación"
        message="¿Estás seguro de anular esta venta? Se revertirá el stock de los productos. Esta acción no se puede deshacer."
      />
    </>
  );
}

Index.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
