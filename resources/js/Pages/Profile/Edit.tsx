import { Head, usePage, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card } from '@/Components/ui/Card';
import { Badge } from '@/Components/ui/Badge';
import InputLabel from '@/Components/InputLabel';
import PasswordInput from '@/Components/PasswordInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import toast from 'react-hot-toast';
import { PropsWithChildren } from 'react';

interface RoleData {
  name: string;
  permissions: string[];
}

function SectionCard({ title, description, children }: PropsWithChildren<{ title: string; description: string }>) {
  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">{description}</p>
        {children}
      </div>
    </Card>
  );
}

function UserInfoCard() {
  const { auth } = usePage().props;
  const user = auth.user;

  return (
    <SectionCard title="Información Personal" description="Datos de tu cuenta">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Nombre</p>
          <p className="text-sm text-slate-900 dark:text-white">{user.name}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Correo Electrónico</p>
          <p className="text-sm text-slate-900 dark:text-white">{user.email}</p>
        </div>
      </div>
    </SectionCard>
  );
}

function RolesCard() {
  const { auth } = usePage().props;
  const rolesData: RoleData[] = auth.roles_data ?? [];

  return (
    <SectionCard title="Roles y Permisos" description="Roles asignados con sus permisos">
      {rolesData.length === 0 ? (
        <p className="text-sm text-slate-400">Sin roles asignados</p>
      ) : (
        <div className="space-y-5">
          {rolesData.map((role) => (
            <div key={role.name}>
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <Badge variant="info">{role.name}</Badge>
              </h4>
              <div className="flex flex-wrap gap-1.5 ml-1">
                {role.permissions.map((perm) => (
                  <span
                    key={perm}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function PasswordForm() {
  const passwordInput = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const updatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    passwordInput.put(route('password.update'), {
      preserveScroll: true,
      onSuccess: () => {
        passwordInput.reset();
        toast.success('Contraseña actualizada correctamente');
      },
      onError: () => passwordInput.reset('password', 'password_confirmation'),
    });
  };

  return (
    <SectionCard title="Cambiar Contraseña" description="Asegúrate de usar una contraseña segura">
      <form onSubmit={updatePassword} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <InputLabel htmlFor="current_password" value="Contraseña Actual" />
            <PasswordInput
              id="current_password"
              value={passwordInput.data.current_password}
              onChange={(e) => passwordInput.setData('current_password', e.target.value)}
              className="mt-1.5 block w-full md:w-1/2"
              autoComplete="current-password"
            />
            <InputError message={passwordInput.errors.current_password} className="mt-2" />
          </div>
          <div>
            <InputLabel htmlFor="password" value="Nueva Contraseña" />
            <PasswordInput
              id="password"
              value={passwordInput.data.password}
              onChange={(e) => passwordInput.setData('password', e.target.value)}
              className="mt-1.5 block w-full"
              autoComplete="new-password"
            />
            <InputError message={passwordInput.errors.password} className="mt-2" />
          </div>
          <div>
            <InputLabel htmlFor="password_confirmation" value="Confirmar Nueva Contraseña" />
            <PasswordInput
              id="password_confirmation"
              value={passwordInput.data.password_confirmation}
              onChange={(e) => passwordInput.setData('password_confirmation', e.target.value)}
              className="mt-1.5 block w-full"
              autoComplete="new-password"
            />
            <InputError message={passwordInput.errors.password_confirmation} className="mt-2" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <PrimaryButton disabled={passwordInput.processing}>Actualizar Contraseña</PrimaryButton>
        </div>
      </form>
    </SectionCard>
  );
}

export default function ProfileEdit() {
  return (
    <>
      <Head title="Perfil" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Perfil</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gestiona tu información personal y contraseña
          </p>
        </div>

        <UserInfoCard />
        <RolesCard />
        <PasswordForm />
      </div>
    </>
  );
}

ProfileEdit.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
