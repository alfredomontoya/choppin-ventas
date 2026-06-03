import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Link, useForm } from '@inertiajs/react';
import { getReturnUrl } from '@/lib/navigation';
import { useState } from 'react';

interface Props {
  return_url?: string;
  productos?: { id: number; nombre: string; codigo: string }[];
}

export default function Form({ return_url, productos = [] }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    producto_id: '',
    tipo: 'ingreso_manual' as string,
    cantidad: '' as string | number,
    motivo: '',
    return_url: return_url ?? getReturnUrl(route('almacen.index')),
  });

  const handleTipoChange = (tipo: string) => {
    setData('tipo', tipo);
    if (tipo !== 'ajuste') {
      setData('cantidad', Math.abs(Number(data.cantidad) || 0));
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('almacen.store'));
  };

  const tipoLabel =
    data.tipo === 'ingreso_manual' ? 'Ingreso Manual' :
    data.tipo === 'egreso_manual' ? 'Egreso Manual' : 'Ajuste';

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <InputLabel htmlFor="producto_id" value="Producto" required />
          <select
            id="producto_id"
            value={data.producto_id}
            onChange={(e) => setData('producto_id', e.target.value)}
            className="mt-1.5 block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Seleccionar producto</option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre} ({p.codigo})</option>
            ))}
          </select>
          <InputError message={errors.producto_id} className="mt-2" />
        </div>

        <div>
          <InputLabel htmlFor="tipo" value="Tipo de Movimiento" required />
          <select
            id="tipo"
            value={data.tipo}
            onChange={(e) => handleTipoChange(e.target.value)}
            className="mt-1.5 block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="ingreso_manual">Ingreso Manual</option>
            <option value="egreso_manual">Egreso Manual</option>
            <option value="ajuste">Ajuste</option>
          </select>
          <InputError message={errors.tipo} className="mt-2" />
        </div>

        <div>
          <InputLabel htmlFor="cantidad" value={data.tipo === 'ajuste' ? 'Cantidad (positivo = aumenta, negativo = reduce)' : 'Cantidad'} required />
          <TextInput
            id="cantidad"
            type="number"
            step="0.01"
            value={data.cantidad}
            onChange={(e) => setData('cantidad', e.target.value)}
            className="mt-1.5 block w-full"
            placeholder={data.tipo === 'ajuste' ? 'Ej: 10 o -5' : '0'}
          />
          <InputError message={errors.cantidad} className="mt-2" />
        </div>

        <div className="md:col-span-2">
          <InputLabel htmlFor="motivo" value="Motivo" required />
          <textarea
            id="motivo"
            value={data.motivo}
            onChange={(e) => setData('motivo', e.target.value)}
            rows={3}
            className="mt-1.5 block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder={`Motivo del ${tipoLabel.toLowerCase()}`}
          />
          <InputError message={errors.motivo} className="mt-2" />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <PrimaryButton disabled={processing}>
          {processing ? 'Registrando...' : 'Registrar Movimiento'}
        </PrimaryButton>
        <Link
          href={route('almacen.index')}
          className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
