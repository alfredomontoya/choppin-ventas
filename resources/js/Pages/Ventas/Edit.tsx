import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card } from '@/Components/ui/Card';
import Form from './Form';

export default function Edit({ venta, return_url, clientes }: { venta: any; return_url?: string; clientes: { id: number; nombre: string; apellido: string; numero_documento: string }[] }) {
  return (
    <>
      <Head title="Editar Venta" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Editar Venta #{venta.numero_comprobante}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Solo puedes modificar las observaciones.
          </p>
        </div>
        <Card>
          <Form venta={venta} return_url={return_url} clientes={clientes} productos={[]} />
        </Card>
      </div>
    </>
  );
}

Edit.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
