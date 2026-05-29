import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Link, useForm } from '@inertiajs/react';

interface Props {
  cliente?: any;
  return_url?: string;
}

export default function Form({ cliente, return_url }: Props) {
  const isEdit = !!cliente;

  const { data, setData, post, put, processing, errors } = useForm({
    nombre: cliente?.nombre ?? '',
    apellido: cliente?.apellido ?? '',
    tipo_documento: cliente?.tipo_documento ?? 'dni',
    numero_documento: cliente?.numero_documento ?? '',
    telefono: cliente?.telefono ?? '',
    email: cliente?.email ?? '',
    direccion: cliente?.direccion ?? '',
    return_url: return_url ?? '',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    isEdit
      ? put(route('clientes.update', cliente.id))
      : post(route('clientes.store'));
  };

  const tipoDocumentos = [
    { value: 'dni', label: 'DNI' },
    { value: 'ce', label: 'Carné de Extranjería' },
    { value: 'ruc', label: 'RUC' },
  ];

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <InputLabel htmlFor="nombre" value="Nombre" />
          <span className="text-red-500 ml-1">*</span>
          <TextInput
            id="nombre"
            type="text"
            value={data.nombre}
            onChange={(e) => setData('nombre', e.target.value)}
            className="mt-1.5 block w-full"
          />
          <InputError message={errors.nombre} className="mt-2" />
        </div>

        <div>
          <InputLabel htmlFor="apellido" value="Apellido" />
          <span className="text-red-500 ml-1">*</span>
          <TextInput
            id="apellido"
            type="text"
            value={data.apellido}
            onChange={(e) => setData('apellido', e.target.value)}
            className="mt-1.5 block w-full"
          />
          <InputError message={errors.apellido} className="mt-2" />
        </div>

        <div>
          <InputLabel htmlFor="tipo_documento" value="Tipo de Documento" />
          <span className="text-red-500 ml-1">*</span>
          <select
            id="tipo_documento"
            value={data.tipo_documento}
            onChange={(e) => setData('tipo_documento', e.target.value)}
            className="mt-1.5 block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {tipoDocumentos.map((td) => (
              <option key={td.value} value={td.value}>{td.label}</option>
            ))}
          </select>
          <InputError message={errors.tipo_documento} className="mt-2" />
        </div>

        <div>
          <InputLabel htmlFor="numero_documento" value="Número de Documento" />
          <span className="text-red-500 ml-1">*</span>
          <TextInput
            id="numero_documento"
            type="text"
            value={data.numero_documento}
            onChange={(e) => setData('numero_documento', e.target.value)}
            className="mt-1.5 block w-full"
          />
          <InputError message={errors.numero_documento} className="mt-2" />
        </div>

        <div>
          <InputLabel htmlFor="telefono" value="Teléfono" />
          <TextInput
            id="telefono"
            type="text"
            value={data.telefono}
            onChange={(e) => setData('telefono', e.target.value)}
            className="mt-1.5 block w-full"
          />
          <InputError message={errors.telefono} className="mt-2" />
        </div>

        <div>
          <InputLabel htmlFor="email" value="Correo Electrónico" />
          <TextInput
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => setData('email', e.target.value)}
            className="mt-1.5 block w-full"
          />
          <InputError message={errors.email} className="mt-2" />
        </div>

        <div className="md:col-span-2">
          <InputLabel htmlFor="direccion" value="Dirección" />
          <textarea
            id="direccion"
            value={data.direccion}
            onChange={(e) => setData('direccion', e.target.value)}
            rows={3}
            className="mt-1.5 block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <InputError message={errors.direccion} className="mt-2" />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <PrimaryButton disabled={processing}>
          {processing ? 'Guardando...' : 'Guardar'}
        </PrimaryButton>
        <Link
          href={route('clientes.index')}
          className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
