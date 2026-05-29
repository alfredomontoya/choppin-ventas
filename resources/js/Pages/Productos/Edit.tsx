import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card } from '@/Components/ui/Card';
import Form from './Form';

export default function Edit({ producto, return_url, categorias }: { producto: any; return_url?: string; categorias?: any[] }) {
  return (
    <>
      <Head title="Editar Producto" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Editar Producto</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Modifica los campos necesarios.
          </p>
        </div>
        <Card>
          <Form producto={producto} return_url={return_url} categorias={categorias} />
        </Card>
      </div>
    </>
  );
}

Edit.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
