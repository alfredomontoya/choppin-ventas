import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card } from '@/Components/ui/Card';
import UserForm from './Form';

export default function Edit({ usuario, roles, userRoles }: { usuario: any; roles: { id: number; name: string }[]; userRoles: number[] }) {
  return (
    <>
      <Head title="Editar Usuario" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Editar Usuario</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{usuario.name}</p>
        </div>

        <Card title="Datos del Usuario">
          <UserForm usuario={usuario} roles={roles} userRoles={userRoles} />
        </Card>
      </div>
    </>
  );
}

Edit.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
