import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Link, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

interface Props {
  categoria_producto?: any;
  return_url?: string;
}

export default function Form({ categoria_producto, return_url }: Props) {
  const isEdit = !!categoria_producto;

  const { data, setData, post, put, processing, errors } = useForm({
    nombre: categoria_producto?.nombre ?? '',
    descripcion: categoria_producto?.descripcion ?? '',
    imagen: categoria_producto?.imagen ?? '',
    return_url: return_url ?? '',
  });

  const [preview, setPreview] = useState<string | null>(
    categoria_producto?.imagen ? String(categoria_producto.imagen) : null
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setData('imagen', file as any);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const removeImage = () => {
    setData('imagen', '');
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const initials = (data.nombre || categoria_producto?.nombre || '').slice(0, 2).toUpperCase();
  const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
  const fallbackColor = colors[(data.nombre || categoria_producto?.nombre || '').length % colors.length];
  const hasImage = preview || (isEdit && categoria_producto?.imagen);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && data.imagen instanceof File) {
      setData('_method' as any, 'put');
      post(route('categoria_productos.update', categoria_producto.id));
    } else if (isEdit) {
      put(route('categoria_productos.update', categoria_producto.id));
    } else {
      post(route('categoria_productos.store'));
    }
  };

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
          <InputLabel htmlFor="imagen" value="Imagen" />
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => inputRef.current?.click()}
            className={`mt-1.5 relative flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
              isDragOver
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 hover:border-indigo-400'
            }`}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="h-full rounded-lg object-contain" />
            ) : hasImage ? (
              <img src={categoria_producto.imagen} alt={categoria_producto.nombre} className="h-full rounded-lg object-contain" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <div className={`w-12 h-12 rounded-full ${fallbackColor} flex items-center justify-center text-white text-base font-bold`}>
                  {initials || '?'}
                </div>
                <span className="text-xs">Arrastra o haz clic para subir</span>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
            />
          </div>
          {preview && (
            <button type="button" onClick={removeImage} className="mt-1.5 text-xs text-red-500 hover:text-red-700">
              Eliminar imagen
            </button>
          )}
          <InputError message={errors.imagen} className="mt-2" />
        </div>

        <div className="md:col-span-2">
          <InputLabel htmlFor="descripcion" value="Descripción" />
          <textarea
            id="descripcion"
            value={data.descripcion}
            onChange={(e) => setData('descripcion', e.target.value)}
            rows={3}
            className="mt-1.5 block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <InputError message={errors.descripcion} className="mt-2" />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <PrimaryButton disabled={processing}>
          {processing ? 'Guardando...' : 'Guardar'}
        </PrimaryButton>
        <Link
          href={route('categoria_productos.index')}
          className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
