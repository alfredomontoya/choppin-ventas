import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card } from '@/Components/ui/Card';
import Form from './Form';

export default function Create({ return_url, productos }: { return_url?: string; productos?: any[] }) {
  return (
    <>
      <Head title="Nuevo Movimiento" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Nuevo Movimiento de Almacén</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Registra un ingreso manual, egreso manual o ajuste de inventario.
          </p>
        </div>
        <Card>
          <Form return_url={return_url} productos={productos} />
        </Card>
      </div>
    </>
  );
}

Create.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
