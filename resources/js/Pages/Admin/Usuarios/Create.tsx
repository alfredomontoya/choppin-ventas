import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card } from '@/Components/ui/Card';
import UserForm from './Form';

export default function Create({ roles }: { roles: { id: number; name: string }[] }) {
  return (
    <>
      <Head title="Nuevo Usuario" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Nuevo Usuario</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Crear un nuevo usuario del sistema</p>
        </div>

        <Card title="Datos del Usuario">
          <UserForm roles={roles} />
        </Card>
      </div>
    </>
  );
}

Create.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
