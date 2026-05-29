import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Link, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

interface Props {
  producto?: any;
  return_url?: string;
  categorias?: any[];
}

function vigentePrice(precios: any[]) {
  if (!precios?.length) return null;
  const hoy = new Date().toISOString().slice(0, 10);
  const d = (v: string) => (v ?? '').slice(0, 10);
  return precios
    .filter((p: any) => d(p.fecha_inicio) <= hoy && (!p.fecha_fin || d(p.fecha_fin) >= hoy))
    .sort((a: any, b: any) => b.fecha_inicio.localeCompare(a.fecha_inicio))[0] ?? null;
}

export default function Form({ producto, return_url, categorias = [] }: Props) {
  const isEdit = !!producto;
  const initialPrice = isEdit ? vigentePrice(producto?.precios) : null;

  const { data, setData, post, put, processing, errors } = useForm({
    categoria_id: producto?.categoria_id ?? '',
    codigo: producto?.codigo ?? '',
    nombre: producto?.nombre ?? '',
    descripcion: producto?.descripcion ?? '',
    imagen: producto?.imagen ?? '',
    stock_actual: producto?.stock_actual ?? 0,
    stock_minimo: producto?.stock_minimo ?? 0,
    unidad_medida: producto?.unidad_medida ?? 'unidad',
    imagenes_nuevas: [] as File[],
    imagenes_eliminar: [] as number[],
    imagenes_orden: [] as number[],
    precio_compra: initialPrice?.precio_compra ?? '',
    precio_venta: initialPrice?.precio_venta ?? '',
    return_url: return_url ?? '',
  });

  const [preview, setPreview] = useState<string | null>(
    producto?.imagen ?? null
  );
  const [coverDragOver, setCoverDragOver] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [multiPreview, setMultiPreview] = useState<string[]>([]);
  const [multiFiles, setMultiFiles] = useState<File[]>([]);
  const multiInputRef = useRef<HTMLInputElement>(null);

  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragNewIdx, setDragNewIdx] = useState<number | null>(null);

  const coverInitials = (data.nombre || producto?.nombre || '').slice(0, 2).toUpperCase();
  const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
  const fallbackColor = colors[(data.nombre || producto?.nombre || '').length % colors.length];

  const existingImages = (producto?.imagenes || []).filter(
    (img: any) => !data.imagenes_eliminar.includes(img.id)
  );

  const handleCoverFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setData('imagen', file as any);
    setPreview(URL.createObjectURL(file));
  };

  const handleCoverDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setCoverDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleCoverFile(file);
  };

  const removeCover = () => {
    setData('imagen', '');
    setPreview(null);
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  const handleMultiFiles = (files: FileList) => {
    const nuevos: File[] = [];
    const nuevosPreviews: string[] = [];
    const remaining = 5 - multiFiles.length - existingImages.length;

    for (let i = 0; i < Math.min(files.length, remaining); i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      nuevos.push(file);
      nuevosPreviews.push(URL.createObjectURL(file));
    }

    setMultiFiles((prev) => [...prev, ...nuevos]);
    setMultiPreview((prev) => [...prev, ...nuevosPreviews]);
    setData('imagenes_nuevas', [...multiFiles, ...nuevos] as any);
  };

  const removeMultiFile = (index: number) => {
    setMultiFiles((prev) => prev.filter((_, i) => i !== index));
    setMultiPreview((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    setData('imagenes_nuevas', multiFiles.filter((_, i) => i !== index) as any);
  };

  const removeExistingImage = (id: number) => {
    setData('imagenes_eliminar', [...data.imagenes_eliminar, id]);
  };

  const handleExistingDrop = (from: number, to: number) => {
    if (from === to) return;
    const reordered = [...existingImages];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    setData('imagenes_orden', reordered.map((img: any) => img.id));
    setDragIdx(null);
  };

  const handleNewDrop = (from: number, to: number) => {
    if (from === to) { setDragNewIdx(null); return; }
    const reorderedFiles = [...multiFiles];
    const reorderedPrevs = [...multiPreview];
    const [movedFile] = reorderedFiles.splice(from, 1);
    const [movedPrev] = reorderedPrevs.splice(from, 1);
    reorderedFiles.splice(to, 0, movedFile);
    reorderedPrevs.splice(to, 0, movedPrev);
    setMultiFiles(reorderedFiles);
    setMultiPreview(reorderedPrevs);
    setData('imagenes_nuevas', reorderedFiles as any);
    setDragNewIdx(null);
  };

  const handleMultiDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) handleMultiFiles(e.dataTransfer.files);
  };

  const hasFiles = data.imagen instanceof File || multiFiles.length > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const routeName = isEdit ? 'productos.update' : 'productos.store';
    const url = isEdit
      ? route(routeName, producto.id)
      : route(routeName);

    if (isEdit && hasFiles) {
      setData('_method' as any, 'put');
      post(url);
    } else if (isEdit) {
      put(url);
    } else {
      post(url);
    }
  };

  const existingImagesCount = existingImages.length;
  const totalImages = existingImagesCount + multiFiles.length;
  const maxReached = totalImages >= 5;

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <InputLabel htmlFor="categoria_id" value="Categoría" />
          <span className="text-red-500 ml-1">*</span>
          <select
            id="categoria_id"
            value={data.categoria_id}
            onChange={(e) => setData('categoria_id', e.target.value)}
            className="mt-1.5 block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Seleccionar categoría</option>
            {categorias.map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>
          <InputError message={errors.categoria_id} className="mt-2" />
        </div>

        <div>
          <InputLabel htmlFor="codigo" value="Código" />
          <span className="text-red-500 ml-1">*</span>
          <TextInput
            id="codigo"
            type="text"
            value={data.codigo}
            onChange={(e) => setData('codigo', e.target.value)}
            className="mt-1.5 block w-full"
          />
          <InputError message={errors.codigo} className="mt-2" />
        </div>

        <div className="md:col-span-2">
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

        <div>
          <InputLabel htmlFor="imagen" value="Imagen Principal" />
          <div
            onDrop={handleCoverDrop}
            onDragOver={(e) => { e.preventDefault(); setCoverDragOver(true); }}
            onDragLeave={() => setCoverDragOver(false)}
            onClick={() => coverInputRef.current?.click()}
            className={`mt-1.5 relative flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
              coverDragOver
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 hover:border-indigo-400'
            }`}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="h-full rounded-lg object-contain" />
            ) : producto?.imagen ? (
              <img src={producto.imagen} alt={producto.nombre} className="h-full rounded-lg object-contain" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <div className={`w-12 h-12 rounded-full ${fallbackColor} flex items-center justify-center text-white text-base font-bold`}>
                  {coverInitials || '?'}
                </div>
                <span className="text-xs">Arrastra o haz clic para subir</span>
              </div>
            )}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverFile(f); }}
              className="hidden"
            />
          </div>
          {preview && (
            <button type="button" onClick={removeCover} className="mt-1.5 text-xs text-red-500 hover:text-red-700">
              Eliminar imagen principal
            </button>
          )}
          <InputError message={errors.imagen} className="mt-2" />
        </div>

        <div>
          <InputLabel value="Imágenes Adicionales" />
          <p className="text-xs text-slate-400 mt-0.5 mb-1">
            {totalImages}/5 — Arrastra o haz clic para agregar
          </p>
          <div
            onDrop={handleMultiDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => !maxReached && multiInputRef.current?.click()}
            className={`mt-1 relative flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
              maxReached
                ? 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 cursor-not-allowed'
                : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 hover:border-indigo-400'
            }`}
          >
            {multiPreview.length > 0 ? (
              <div className="flex flex-wrap gap-2 p-2 justify-center overflow-y-auto h-full">
                {multiPreview.map((p, i) => (
                  <div
                    key={i}
                    draggable
                    onDragStart={() => setDragNewIdx(i)}
                    onDragOver={(e) => { e.preventDefault(); }}
                    onDrop={(e) => { e.preventDefault(); handleNewDrop(dragNewIdx!, i); }}
                    className={`relative group border rounded p-0.5 transition-colors ${
                      dragNewIdx === i ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30' : 'border-transparent'
                    }`}
                  >
                    <img src={p} alt="" className="w-12 h-12 rounded object-cover cursor-grab active:cursor-grabbing" />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeMultiFile(i); }}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs">Arrastra o haz clic para subir</span>
              </div>
            )}
            <input
              ref={multiInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => { if (e.target.files) handleMultiFiles(e.target.files); }}
              className="hidden"
            />
          </div>
          <InputError message={errors.imagenes_nuevas} className="mt-2" />
        </div>

        {isEdit && existingImages.length > 0 && (
          <div className="md:col-span-2">
            <InputLabel value="Imágenes Existentes" />
            <p className="text-xs text-slate-400 mt-0.5 mb-1">Arrastra para reordenar</p>
            <div className="mt-1.5 flex flex-wrap gap-3">
              {existingImages.map((img: any, idx: number) => (
                <div
                  key={img.id}
                  draggable
                  onDragStart={() => setDragIdx(idx)}
                  onDragOver={(e) => { e.preventDefault(); }}
                  onDrop={(e) => { e.preventDefault(); handleExistingDrop(dragIdx!, idx); }}
                  className={`relative group border rounded-lg p-1 transition-colors ${
                    dragIdx === idx ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30' : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <img src={img.ruta} alt="" className="w-16 h-16 rounded object-cover cursor-grab active:cursor-grabbing" />
                  <div className="flex justify-center mt-1">
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img.id)}
                      className="text-xs text-red-500 hover:text-red-700 px-1"
                      title="Eliminar"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              {data.imagenes_eliminar.length > 0 && (
                <p className="text-xs text-red-400 w-full mt-1">
                  {data.imagenes_eliminar.length} imagen(es) marcada(s) para eliminar al guardar.
                </p>
              )}
            </div>
            <InputError message={errors.imagenes_eliminar} className="mt-2" />
          </div>
        )}

        <div>
          <InputLabel htmlFor="precio_compra" value="Precio de Compra" />
          <span className="text-red-500 ml-1">*</span>
          <TextInput
            id="precio_compra"
            type="number"
            step="0.01"
            value={data.precio_compra}
            onChange={(e) => setData('precio_compra', e.target.value as any)}
            className="mt-1.5 block w-full"
          />
          <InputError message={errors.precio_compra} className="mt-2" />
        </div>

        <div>
          <InputLabel htmlFor="precio_venta" value="Precio de Venta" />
          <span className="text-red-500 ml-1">*</span>
          <TextInput
            id="precio_venta"
            type="number"
            step="0.01"
            value={data.precio_venta}
            onChange={(e) => setData('precio_venta', e.target.value as any)}
            className="mt-1.5 block w-full"
          />
          <InputError message={errors.precio_venta} className="mt-2" />
        </div>

        <div>
          <InputLabel htmlFor="stock_actual" value="Stock Actual" />
          <span className="text-red-500 ml-1">*</span>
          <TextInput
            id="stock_actual"
            type="number"
            step="0.01"
            value={data.stock_actual}
            onChange={(e) => setData('stock_actual', e.target.value as any)}
            className="mt-1.5 block w-full"
          />
          <InputError message={errors.stock_actual} className="mt-2" />
        </div>

        <div>
          <InputLabel htmlFor="stock_minimo" value="Stock Mínimo" />
          <span className="text-red-500 ml-1">*</span>
          <TextInput
            id="stock_minimo"
            type="number"
            step="0.01"
            value={data.stock_minimo}
            onChange={(e) => setData('stock_minimo', e.target.value as any)}
            className="mt-1.5 block w-full"
          />
          <InputError message={errors.stock_minimo} className="mt-2" />
        </div>

        <div>
          <InputLabel htmlFor="unidad_medida" value="Unidad de Medida" />
          <span className="text-red-500 ml-1">*</span>
          <select
            id="unidad_medida"
            value={data.unidad_medida}
            onChange={(e) => setData('unidad_medida', e.target.value)}
            className="mt-1.5 block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="unidad">Unidad</option>
            <option value="kg">Kg</option>
            <option value="litro">Litro</option>
            <option value="caja">Caja</option>
            <option value="pack">Pack</option>
            <option value="metro">Metro</option>
            <option value="par">Par</option>
          </select>
          <InputError message={errors.unidad_medida} className="mt-2" />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <PrimaryButton disabled={processing}>
          {processing ? 'Guardando...' : 'Guardar'}
        </PrimaryButton>
        <Link
          href={route('productos.index')}
          className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
