import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card } from '@/Components/ui/Card';
import Form from './Form';

export default function Edit({ orden, return_url, proveedores, productos }: { orden: any; return_url?: string; proveedores: any[]; productos: any[] }) {
  return (
    <>
      <Head title="Editar Orden de Compra" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Editar Orden #{orden.numero_comprobante}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Solo puedes modificar las observaciones.
          </p>
        </div>
        <Card>
          <Form orden={orden} return_url={return_url} proveedores={proveedores} productos={productos} />
        </Card>
      </div>
    </>
  );
}

Edit.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
