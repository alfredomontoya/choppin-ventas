import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card } from '@/Components/ui/Card';
import Form from './Form';

export default function Create({ return_url, categorias }: { return_url?: string; categorias?: any[] }) {
  return (
    <>
      <Head title="Crear Producto" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Crear Producto</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Completa los campos para registrar un nuevo producto.
          </p>
        </div>
        <Card>
          <Form return_url={return_url} categorias={categorias} />
        </Card>
      </div>
    </>
  );
}

Create.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
