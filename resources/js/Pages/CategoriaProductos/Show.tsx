import { Head, Link, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card } from '@/Components/ui/Card';
import { ConfirmDialog } from '@/Components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';

export default function Show({ categoria_producto, url_anterior }: { categoria_producto: any; url_anterior?: string }) {
  const { flash } = usePage().props as any;
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  const eliminar = () => {
    router.delete(route('categoria_productos.destroy', categoria_producto.id), {
      onSuccess: () => setShowDelete(false),
    });
  };

  const fields = [
    { label: 'ID', value: categoria_producto.id, type: 'text' },
    { label: 'Nombre', value: categoria_producto.nombre, type: 'text' },
    { label: 'Descripción', value: categoria_producto.descripcion ?? '—', type: 'textarea' },
    { label: 'Estado', value: categoria_producto.activo ? 'Activo' : 'Inactivo', type: 'text' },
  ];

  const imageUrl = categoria_producto.imagen;
  const initials = (categoria_producto.nombre ?? '').slice(0, 2).toUpperCase();
  const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
  const fallbackColor = colors[(categoria_producto.nombre ?? '').length % colors.length];

  return (
    <>
      <Head title="Detalle de Categoría" />
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {categoria_producto.nombre}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {categoria_producto.activo ? 'Categoría activa' : 'Categoría inactiva'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={route('categoria_productos.create', { return_url: url_anterior ?? undefined })}
              className="shrink-0 px-3 py-1.5 md:px-4 md:py-2 rounded-lg bg-emerald-600 text-white text-xs md:text-sm hover:bg-emerald-700 transition-colors"
            >
              + Nueva Categoría
            </Link>
            <Link
              href={url_anterior ?? route('categoria_productos.index')}
              className="shrink-0 px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-xs md:text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Aceptar
            </Link>
            <Link
              href={route('categoria_productos.edit', [categoria_producto.id, { return_url: url_anterior ?? undefined }])}
              className="shrink-0 px-3 py-1.5 md:px-4 md:py-2 rounded-lg bg-indigo-600 text-white text-xs md:text-sm hover:bg-indigo-700 transition-colors"
            >
              Editar
            </Link>
            <button
              onClick={() => setShowDelete(true)}
              className="shrink-0 px-3 py-1.5 md:px-4 md:py-2 rounded-lg bg-red-600 text-white text-xs md:text-sm hover:bg-red-700 transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>

        <Card>
          <div className="flex justify-center mb-6">
            {imageUrl ? (
              <img src={imageUrl} alt={categoria_producto.nombre} className="w-32 h-32 rounded-xl object-cover shadow-md" />
            ) : (
              <div className={`w-32 h-32 rounded-xl ${fallbackColor} flex items-center justify-center text-white text-3xl font-bold`}>
                {initials}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {fields.map((f) => (
              <div key={f.label} className={f.type === 'textarea' ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  {f.label}
                </label>
                {f.type === 'textarea' ? (
                  <textarea
                    readOnly
                    rows={3}
                    value={f.value}
                    className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 px-3 py-2 text-sm cursor-default"
                  />
                ) : (
                  <input
                    type="text"
                    readOnly
                    value={f.value}
                    className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 px-3 py-2 text-sm cursor-default"
                  />
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={eliminar}
        title="Confirmar eliminación"
        message={`¿Estás seguro de eliminar la categoría "${categoria_producto.nombre}"? Esta acción no se puede deshacer.`}
      />
    </>
  );
}

Show.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
