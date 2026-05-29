import { Head, Link, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card } from '@/Components/ui/Card';
import { ConfirmDialog } from '@/Components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';

export default function Show({ proveedor, url_anterior }: { proveedor: any; url_anterior?: string }) {
  const { flash } = usePage().props as any;
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  const eliminar = () => {
    router.delete(route('proveedores.destroy', proveedor.id), {
      onSuccess: () => setShowDelete(false),
    });
  };

  const fields = [
    { label: 'ID', value: proveedor.id, type: 'text' },
    { label: 'Nombre', value: proveedor.nombre, type: 'text' },
    { label: 'Contacto', value: proveedor.contacto ?? '—', type: 'text' },
    { label: 'Teléfono', value: proveedor.telefono ?? '—', type: 'text' },
    { label: 'Email', value: proveedor.email ?? '—', type: 'text' },
    { label: 'NIT/CI', value: proveedor.nit_ci ?? '—', type: 'text' },
    { label: 'Dirección', value: proveedor.direccion ?? '—', type: 'textarea' },
  ];

  return (
    <>
      <Head title="Detalle del Proveedor" />
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {proveedor.nombre}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {proveedor.nit_ci ? `NIT/CI: ${proveedor.nit_ci}` : 'Sin identificación'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={route('proveedores.create', { return_url: url_anterior ?? undefined })}
              className="shrink-0 px-3 py-1.5 md:px-4 md:py-2 rounded-lg bg-emerald-600 text-white text-xs md:text-sm hover:bg-emerald-700 transition-colors"
            >
              + Nuevo Proveedor
            </Link>
            <Link
              href={url_anterior ?? route('proveedores.index')}
              className="shrink-0 px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-xs md:text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Aceptar
            </Link>
            <Link
              href={route('proveedores.edit', [proveedor.id, { return_url: url_anterior ?? undefined }])}
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
        message={`¿Estás seguro de eliminar a ${proveedor.nombre}? Esta acción no se puede deshacer.`}
      />
    </>
  );
}

Show.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
