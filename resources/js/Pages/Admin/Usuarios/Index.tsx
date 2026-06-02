import { Head, Link, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card } from '@/Components/ui/Card';
import { Pagination } from '@/Components/ui/Pagination';
import { ConfirmDialog } from '@/Components/ui/ConfirmDialog';
import { Badge } from '@/Components/ui/Badge';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';

const columns = [
  { key: 'name', label: 'Nombre' },
  { key: 'email', label: 'Email' },
  {
    key: 'roles',
    label: 'Roles',
    render: (u: any) => u.roles?.length
      ? u.roles.map((r: any) => r.name).join(', ')
      : <span className="text-slate-400">—</span>,
  },
  {
    key: 'activo',
    label: 'Estado',
    render: (u: any) => (
      <Badge variant={u.activo ? 'success' : 'danger'}>
        {u.activo ? 'Activo' : 'Inactivo'}
      </Badge>
    ),
  },
  {
    key: 'ultimo_acceso',
    label: 'Último Acceso',
    render: (u: any) => u.ultimo_acceso ? new Date(u.ultimo_acceso).toLocaleDateString('es-BO') : '—',
  },
];

export default function Index({ usuarios, filtros }: { usuarios: any; filtros: any }) {
  const { flash } = usePage().props as any;
  const [search, setSearch] = useState<string>(filtros.busqueda ?? '');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('admin.usuarios.index', { ...filtros, busqueda: search || undefined }), {}, { preserveState: true, replace: true });
  };

  const handleSort = (field: string) => {
    const dir = filtros.orden === field && filtros.direccion === 'asc' ? 'desc' : 'asc';
    router.get(route('admin.usuarios.index', { ...filtros, orden: field, direccion: dir }), {}, { preserveState: true, replace: true });
  };

  const handlePagination = (params: Record<string, any>) => {
    router.get(route('admin.usuarios.index', { ...filtros, ...params }), {}, { preserveState: true, replace: true });
  };

  const handleToggle = (id: number) => {
    router.patch(route('admin.usuarios.toggle-activo', id));
  };

  const confirmDelete = (id: number) => setDeleteId(id);

  const handleDelete = () => {
    if (deleteId !== null) {
      router.delete(route('admin.usuarios.destroy', deleteId), {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  return (
    <>
      <Head title="Usuarios" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Usuarios</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gestión de usuarios del sistema</p>
          </div>
          <Link
            href={route('admin.usuarios.create')}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + Nuevo Usuario
          </Link>
        </div>

        <Card>
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre o email..."
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Buscar
              </button>
            </form>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 dark:border-slate-700">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="px-4 py-3 text-left text-slate-500 dark:text-slate-400 font-medium cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-300 transition-colors whitespace-nowrap lg:whitespace-normal"
                      onClick={() => handleSort(col.key)}
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        <span className="text-xs">
                          {filtros.orden === col.key ? (filtros.direccion === 'asc' ? '↑' : '↓') : '↕'}
                        </span>
                      </div>
                    </th>
                  ))}
                  <th className="text-right px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {usuarios.data.map((user: any) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        {col.render ? col.render(user) : user[col.key]}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => handleToggle(user.id)}
                        className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        {user.activo ? 'Desactivar' : 'Activar'}
                      </button>
                      <Link
                        href={route('admin.usuarios.edit', user.id)}
                        className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => confirmDelete(user.id)}
                        className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {usuarios.data.length === 0 && (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-4 py-12 text-center text-slate-400">
                      No se encontraron usuarios
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4">
            <Pagination
              meta={usuarios}
              porPagina={Number(filtros.por_pagina) || 10}
              onChange={handlePagination}
            />
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar Usuario"
        message="¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer."
      />
    </>
  );
}

Index.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
