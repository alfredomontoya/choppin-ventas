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

const initials = (name: string) => name.slice(0, 2).toUpperCase();
const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-purple-500', 'bg-teal-500', 'bg-pink-500'];

function ImageCell({ src, name }: { src: string | null; name: string }) {
  if (src) {
    return <img src={src} alt={name} className="w-10 h-10 rounded-lg object-cover" />;
  }
  return (
    <div className={`w-10 h-10 rounded-lg ${colors[name.length % colors.length]} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
      {initials(name)}
    </div>
  );
}

const stockCell = (p: any) => {
  const bajo = Number(p.stock_actual) <= Number(p.stock_minimo);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
      bajo
        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${bajo ? 'bg-red-500' : 'bg-emerald-500'}`} />
      {p.stock_actual} / {p.stock_minimo}
    </span>
  );
};

const columnas = [
  { key: 'imagen', label: '', render: (p: any) => <ImageCell src={p.imagenes?.[0]?.ruta ?? null} name={p.nombre} /> },
  { key: 'codigo', label: 'Código' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'categoria', label: 'Categoría', render: (p: any) => p.categoria?.nombre ?? '—' },
  { key: 'stock_actual', label: 'Stock', render: stockCell },
  { key: 'unidad_medida', label: 'Unidad' },
  { key: 'activo', label: 'Estado', render: (p: any) => p.activo ? 'Activo' : 'Inactivo' },
];

const STOCK_KEYS = ['stock_bajo', 'con_stock', 'sin_stock', 'stock_desde', 'stock_hasta'];

export default function Index({ productos, filtros, productosFavoritos }: { productos: any; filtros: any; productosFavoritos?: number[] }) {
  const { flash } = usePage().props as any;
  const [search, setSearch] = useState<string>(filtros.busqueda ?? '');
  const [filtroStock, setFiltroStock] = useState<string>(filtros.stock_bajo ? 'stock_bajo' : filtros.con_stock ? 'con_stock' : filtros.sin_stock ? 'sin_stock' : '');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [favoritos, setFavoritos] = useState<Set<number>>(
    () => new Set(productosFavoritos ?? [])
  );

  const filtrosBase = (): Record<string, any> => {
    const rest: Record<string, any> = {};
    for (const k of Object.keys(filtros)) {
      if (!STOCK_KEYS.includes(k)) rest[k] = filtros[k];
    }
    return rest;
  };

  const filtrosConStock = (): Record<string, any> => {
    const base = filtrosBase();
    if (filtroStock === 'stock_bajo') base.stock_bajo = '1';
    else if (filtroStock === 'con_stock') base.con_stock = '1';
    else if (filtroStock === 'sin_stock') base.sin_stock = '1';
    return base;
  };

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  useEffect(() => {
    if (filtros.por_pagina === undefined) {
      const pp = window.innerWidth < 768 ? 5 : 10;
      if (pp !== 10) {
        router.get(route('productos.index', { ...filtrosBase(), por_pagina: pp, busqueda: search || undefined }), {}, { replace: true });
      }
    }
  }, []);

  const aplicarFiltros = () => {
    router.get(route('productos.index'), {
      ...filtrosConStock(),
      busqueda: search || undefined,
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
    setFiltroStock('');
    router.get(route('productos.index'), {}, { preserveState: true, replace: true });
  };

  const ordenar = (columna: string) => {
    router.get(route('productos.index'), {
      ...filtrosConStock(),
      orden: columna,
      direccion: filtros.orden === columna && filtros.direccion === 'asc' ? 'desc' : 'asc',
      busqueda: search,
    }, { preserveState: true, replace: true });
  };

  const cambiarPagina = (params: Record<string, any>) => {
    router.get(route('productos.index'), { ...filtrosConStock(), ...params, busqueda: search }, { preserveState: true, replace: true });
  };

  const confirmarEliminar = (id: number) => setDeleteId(id);

  const eliminar = () => {
    if (!deleteId) return;
    router.delete(route('productos.destroy', deleteId), {
      onSuccess: () => setDeleteId(null),
    });
  };

  const toggleFavorito = (id: number) => {
    setFavoritos((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    router.post(route('productos.favorito', id), {}, {
      preserveState: true,
      preserveScroll: true,
      onError: () => {
        setFavoritos((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id); else next.add(id);
          return next;
        });
      },
    });
  };

  const resultados = productos.total ?? 0;
  const filtrosActivos = search !== '';

  return (
    <>
      <Head title="Productos" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Productos</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {filtrosActivos
                ? `Se encontraron ${resultados} ${resultados === 1 ? 'coincidencia' : 'coincidencias'}`
                : `${resultados} ${resultados === 1 ? 'registro' : 'registros'} en total`
              }
            </p>
          </div>
          <Link
            href={route('productos.create')}
            onClick={() => saveReturnUrl()}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            + Nuevo Producto
          </Link>
        </div>

        <Card>
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <input
                type="text"
                placeholder="Buscar por nombre, código o descripción..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch('');
                    router.get(route('productos.index'), { ...filtrosBase(), busqueda: undefined }, { preserveState: true });
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
            <button type="button" onClick={aplicarFiltros} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-colors">
              Buscar
            </button>
            <button onClick={limpiarFiltros} className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              Limpiar
            </button>
            <select
              value={filtroStock}
              onChange={(e) => {
                const val = e.target.value;
                setFiltroStock(val);
                const base = filtrosBase();
                if (val === 'stock_bajo') base.stock_bajo = '1';
                else if (val === 'con_stock') base.con_stock = '1';
                else if (val === 'sin_stock') base.sin_stock = '1';
                router.get(route('productos.index'), { ...base, page: 1 }, { preserveState: true, replace: true });
              }}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todos los stocks</option>
              <option value="stock_bajo">Stock Bajo</option>
              <option value="con_stock">Con Stock</option>
              <option value="sin_stock">Sin Stock</option>
            </select>
            <button
              onClick={() => { window.location.href = route('productos.exportar', filtrosConStock()); }}
              className="px-4 py-2 rounded-lg border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
            >
              Exportar Excel
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-2 py-3 text-center text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap w-10">
                    Fav
                  </th>
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
                {productos.data?.length === 0 ? (
                  <tr>
                    <td colSpan={columnas.length + 2} className="px-4 py-12 text-center text-slate-400">
                      No se encontraron productos.
                    </td>
                  </tr>
                ) : (
                  productos.data?.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-2 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleFavorito(item.id)}
                          className={`p-1 rounded-lg transition-colors ${
                            favoritos.has(item.id)
                              ? 'text-amber-400 hover:text-amber-500'
                              : 'text-slate-300 dark:text-slate-600 hover:text-amber-400'
                          }`}
                          title={favoritos.has(item.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                        >
                          {favoritos.has(item.id) ? '★' : '☆'}
                        </button>
                      </td>
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
                          <Link href={route('productos.show', item.id)} onClick={() => saveReturnUrl()} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Ver">
                            👁
                          </Link>
                          <Link href={route('productos.edit', item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Editar">
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
            meta={productos.meta ?? productos}
            porPagina={filtros.por_pagina ?? 10}
            onChange={cambiarPagina}
          />
          <div className="flex items-center gap-4 px-4 py-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700/50">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Stock normal (stock actual &gt; stock mínimo)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Stock bajo (stock actual &le; stock mínimo)
            </span>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={eliminar}
        title="Confirmar eliminación"
        message="¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer."
      />
    </>
  );
}

Index.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
