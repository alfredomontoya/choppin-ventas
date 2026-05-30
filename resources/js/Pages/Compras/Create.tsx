import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card } from '@/Components/ui/Card';
import Form from './Form';

export default function Create({ return_url, proveedores, productos }: { return_url?: string; proveedores: any[]; productos: any[] }) {
  return (
    <>
      <Head title="Nueva Orden de Compra" />
      <div className="space-y-6">
        <Card>
          <Form return_url={return_url} proveedores={proveedores} productos={productos} />
        </Card>
      </div>
    </>
  );
}

Create.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
