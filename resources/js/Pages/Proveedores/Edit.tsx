import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card } from '@/Components/ui/Card';
import Form from './Form';

export default function Edit({ proveedor, return_url }: { proveedor: any; return_url?: string }) {
  return (
    <>
      <Head title="Editar Proveedor" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Editar Proveedor</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Modifica los campos necesarios.
          </p>
        </div>
        <Card>
          <Form proveedor={proveedor} return_url={return_url} />
        </Card>
      </div>
    </>
  );
}

Edit.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
