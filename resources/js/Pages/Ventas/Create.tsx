import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card } from '@/Components/ui/Card';
import Form from './Form';

export default function Create({ return_url, clientes, productos }: { return_url?: string; clientes: any[]; productos: any[] }) {
  return (
    <>
      <Head title="Nueva Venta" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Nueva Venta</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Registra una nueva venta seleccionando los productos.
          </p>
        </div>
        <Card>
          <Form return_url={return_url} clientes={clientes} productos={productos} />
        </Card>
      </div>
    </>
  );
}

Create.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
