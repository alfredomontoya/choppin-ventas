import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import Checkbox from '@/Components/Checkbox';
import { Link, useForm } from '@inertiajs/react';

interface RoleOption {
  id: number;
  name: string;
}

interface Props {
  usuario?: any;
  roles: RoleOption[];
  userRoles?: number[];
}

export default function UserForm({ usuario, roles, userRoles }: Props) {
  const isEdit = !!usuario;

  const { data, setData, post, put, processing, errors } = useForm({
    name: usuario?.name ?? '',
    email: usuario?.email ?? '',
    password: '',
    password_confirmation: '',
    activo: usuario?.activo ?? true,
    roles: userRoles ?? [],
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    isEdit
      ? put(route('admin.usuarios.update', usuario.id))
      : post(route('admin.usuarios.store'));
  };

  const toggleRole = (roleId: number) => {
    setData('roles', data.roles.includes(roleId)
      ? data.roles.filter((r: number) => r !== roleId)
      : [...data.roles, roleId],
    );
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <InputLabel htmlFor="name" value="Nombre" />
          <span className="text-red-500 ml-1">*</span>
          <TextInput
            id="name"
            type="text"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            className="mt-1.5 block w-full"
          />
          <InputError message={errors.name} className="mt-2" />
        </div>

        <div>
          <InputLabel htmlFor="email" value="Email" />
          <span className="text-red-500 ml-1">*</span>
          <TextInput
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => setData('email', e.target.value)}
            className="mt-1.5 block w-full"
          />
          <InputError message={errors.email} className="mt-2" />
        </div>

        <div>
          <InputLabel htmlFor="password" value={isEdit ? 'Contraseña (dejar vacío para no cambiar)' : 'Contraseña'} />
          <span className="text-red-500 ml-1">{isEdit ? '' : '*'}</span>
          <TextInput
            id="password"
            type="password"
            value={data.password}
            onChange={(e) => setData('password', e.target.value)}
            className="mt-1.5 block w-full"
          />
          <InputError message={errors.password} className="mt-2" />
        </div>

        <div>
          <InputLabel htmlFor="password_confirmation" value="Confirmar Contraseña" />
          <TextInput
            id="password_confirmation"
            type="password"
            value={data.password_confirmation}
            onChange={(e) => setData('password_confirmation', e.target.value)}
            className="mt-1.5 block w-full"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 mt-6">
            <Checkbox
              checked={data.activo}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('activo', e.target.checked)}
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">Usuario Activo</span>
          </label>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Roles</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {roles.map((role) => (
            <label
              key={role.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <Checkbox
                checked={data.roles.includes(role.id)}
                onChange={() => toggleRole(role.id)}
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {role.name}
              </span>
            </label>
          ))}
        </div>
        <InputError message={errors.roles} className="mt-2" />
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <PrimaryButton disabled={processing}>
          {processing ? 'Guardando...' : 'Guardar'}
        </PrimaryButton>
        <Link
          href={route('admin.usuarios.index')}
          className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
