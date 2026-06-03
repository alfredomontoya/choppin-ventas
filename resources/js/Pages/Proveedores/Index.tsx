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
  { key: 'nombre', label: 'Nombre' },
  { key: 'contacto', label: 'Contacto', render: (p: any) => p.contacto ?? '—' },
  { key: 'telefono', label: 'Teléfono', render: (p: any) => p.telefono ?? '—' },
  { key: 'email', label: 'Email', render: (p: any) => p.email ?? '—' },
  { key: 'nit_ci', label: 'NIT/CI', render: (p: any) => p.nit_ci ?? '—' },
];

export default function Index({ proveedores, filtros }: { proveedores: any; filtros: any }) {
  const { flash } = usePage().props as any;
  const [search, setSearch] = useState<string>(filtros.busqueda ?? '');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const porPaginaDefault = window.innerWidth < 768 ? 5 : 10;

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  useEffect(() => {
    if (filtros.por_pagina === undefined) {
      const pp = window.innerWidth < 768 ? 5 : 10;
      if (pp !== 10) {
        router.get(route('proveedores.index', { ...filtros, por_pagina: pp, busqueda: search || undefined }), {}, { replace: true });
      }
    }
  }, []);

  const aplicarFiltros = () => {
    router.get(route('proveedores.index'), {
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
    router.get(route('proveedores.index'), {}, { preserveState: true, replace: true });
  };

  const ordenar = (columna: string) => {
    router.get(route('proveedores.index'), {
      ...filtros,
      orden: columna,
      direccion: filtros.orden === columna && filtros.direccion === 'asc' ? 'desc' : 'asc',
      busqueda: search,
    }, { preserveState: true, replace: true });
  };

  const cambiarPagina = (params: Record<string, any>) => {
    router.get(route('proveedores.index'), { ...filtros, ...params, busqueda: search }, { preserveState: true, replace: true });
  };

  const confirmarEliminar = (id: number) => setDeleteId(id);

  const eliminar = () => {
    if (!deleteId) return;
    router.delete(route('proveedores.destroy', deleteId), {
      onSuccess: () => setDeleteId(null),
    });
  };

  const resultados = proveedores.total ?? 0;
  const filtrosActivos = search !== '';

  return (
    <>
      <Head title="Proveedores" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Proveedores</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {filtrosActivos
                ? `Se encontraron ${resultados} ${resultados === 1 ? 'coincidencia' : 'coincidencias'}`
                : `${resultados} ${resultados === 1 ? 'registro' : 'registros'} en total`
              }
            </p>
          </div>
          <Link
            href={route('proveedores.create')}
            onClick={() => saveReturnUrl()}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            + Nuevo Proveedor
          </Link>
        </div>

        <Card>
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <input
                type="text"
                placeholder="Buscar por nombre, contacto, teléfono, email o NIT/CI..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch('');
                    router.get(route('proveedores.index'), { ...filtros, busqueda: undefined }, { preserveState: true });
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
              onClick={() => { window.location.href = route('proveedores.exportar', filtros); }}
              className="px-4 py-2 rounded-lg border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
            >
              Exportar Excel
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
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
                {proveedores.data?.length === 0 ? (
                  <tr>
                    <td colSpan={columnas.length + 1} className="px-4 py-12 text-center text-slate-400">
                      No se encontraron proveedores.
                    </td>
                  </tr>
                ) : (
                  proveedores.data?.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      {columnas.map((col) => (
                        <td key={col.key} className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap lg:whitespace-normal">
                          {filtros.busqueda
                            ? <HighlightText text={col.render ? col.render(item) : String(item[col.key] ?? '')} query={filtros.busqueda} />
                            : (col.render ? col.render(item) : item[col.key])
                          }
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={route('proveedores.show', item.id)} onClick={() => saveReturnUrl()} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Ver">
                            👁
                          </Link>
                          <Link href={route('proveedores.edit', item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Editar">
                            ✏️
                          </Link>
                          <button onClick={() => confirmarEliminar(item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Eliminar">
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            meta={proveedores.meta ?? proveedores}
            porPagina={filtros.por_pagina ?? porPaginaDefault}
            onChange={cambiarPagina}
          />
        </Card>
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={eliminar}
        title="Confirmar eliminación"
        message="¿Estás seguro de eliminar este proveedor? Esta acción no se puede deshacer."
      />
    </>
  );
}

Index.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
