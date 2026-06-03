import { useRef, useState, useCallback } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Link, useForm } from '@inertiajs/react';
import { getReturnUrl } from '@/lib/navigation';

interface Props {
  producto?: any;
  return_url?: string;
  categorias?: any[];
}

interface OrderedImage {
  key: string;
  id?: number;
  url: string;
  file?: File;
}

interface ProductoForm {
  categoria_id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  stock_actual: number;
  stock_minimo: number;
  unidad_medida: string;
  imagenes_nuevas: File[];
  imagenes_eliminar: number[];
  imagenes_orden: number[];
  precio_compra: string;
  precio_venta: string;
  return_url: string;
  _method: string;
}

const selectClassName =
  'mt-1.5 block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500';

const noopDragOver = (e: React.DragEvent) => e.preventDefault();

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
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, setData, post, put, processing, errors } = useForm<ProductoForm>({
    categoria_id: producto?.categoria_id ?? '',
    codigo: producto?.codigo ?? '',
    nombre: producto?.nombre ?? '',
    descripcion: producto?.descripcion ?? '',
    stock_actual: producto?.stock_actual ?? 0,
    stock_minimo: producto?.stock_minimo ?? 0,
    unidad_medida: producto?.unidad_medida ?? 'unidad',
    imagenes_nuevas: [],
    imagenes_eliminar: [],
    imagenes_orden: [],
    precio_compra: initialPrice?.precio_compra ?? '',
    precio_venta: initialPrice?.precio_venta ?? '',
    return_url: return_url ?? getReturnUrl(route('productos.index')),
    _method: '',
  });

  const [ordered, setOrdered] = useState<OrderedImage[]>(() => {
    if (!isEdit) return [];
    return (producto.imagenes || []).map((img: any) => ({
      key: `e-${img.id}`,
      id: img.id,
      url: img.ruta,
    }));
  });

  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const totalImages = ordered.length;
  const maxReached = totalImages >= 5;

  const resetImageFields = useCallback(() => {
    setData('imagenes_orden', []);
    setData('imagenes_nuevas', []);
  }, [setData]);

  const addFiles = useCallback((files: FileList) => {
    setOrdered((prev) => {
      const nuevos: OrderedImage[] = [];
      const remaining = 5 - prev.length;
      for (let i = 0; i < Math.min(files.length, remaining); i++) {
        const f = files[i];
        if (!f.type.startsWith('image/')) continue;
        const key = `n-${Date.now()}-${i}`;
        nuevos.push({ key, url: URL.createObjectURL(f), file: f });
      }
      if (nuevos.length === 0) return prev;
      return [...prev, ...nuevos];
    });
    resetImageFields();
  }, [resetImageFields]);

  const removeImage = useCallback((idx: number) => {
    const img = ordered[idx];
    if (!img) return;
    if (img.file) URL.revokeObjectURL(img.url);
    if (img.id) setData('imagenes_eliminar', [...data.imagenes_eliminar, img.id]);
    setOrdered((prev) => prev.filter((_, i) => i !== idx));
    resetImageFields();
  }, [ordered, data.imagenes_eliminar, setData, resetImageFields]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const moveImage = (from: number, to: number) => {
    if (from === to) return;
    setOrdered((prev) => {
      const reordered = [...prev];
      const [moved] = reordered.splice(from, 1);
      reordered.splice(to, 0, moved);
      return reordered;
    });
    setDragIdx(null);
  };

  const buildOrderPayload = () => {
    const files: File[] = [];
    const orden: number[] = [];
    for (const img of ordered) {
      if (img.file) {
        files.push(img.file);
        orden.push(0);
      } else if (img.id) {
        orden.push(img.id);
      }
    }
    return { files, orden };
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const { files, orden } = buildOrderPayload();
    setData('imagenes_nuevas', files);
    setData('imagenes_orden', orden);

    const routeName = isEdit ? 'productos.update' : 'productos.store';
    const url = isEdit
      ? route(routeName, producto.id)
      : route(routeName);

    if (isEdit && (files.length > 0 || orden.length > 0)) {
      setData('_method', 'put');
      post(url);
    } else if (isEdit) {
      put(url);
    } else {
      post(url);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <InputLabel htmlFor="categoria_id" value="Categoría" required />
          <select
            id="categoria_id"
            value={data.categoria_id}
            onChange={(e) => setData('categoria_id', e.target.value)}
            className={selectClassName}
          >
            <option value="">Seleccionar categoría</option>
            {categorias.map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>
          <InputError message={errors.categoria_id} className="mt-2" />
        </div>

        <div>
          <InputLabel htmlFor="codigo" value="Código" required />
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
          <InputLabel htmlFor="nombre" value="Nombre" required />
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
          <InputLabel htmlFor="descripcion" value="Descripción" optional />
          <textarea
            id="descripcion"
            value={data.descripcion}
            onChange={(e) => setData('descripcion', e.target.value)}
            rows={3}
            className={selectClassName}
          />
          <InputError message={errors.descripcion} className="mt-2" />
        </div>

        <div className="md:col-span-2">
          <InputLabel value="Imágenes" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
            <div>
              <p className="text-xs text-slate-400 mt-0.5 mb-2">
                {totalImages}/5 — Arrastra para reordenar. La primera imagen será la principal.
              </p>

              <div className="grid grid-cols-1">
                {!maxReached && (
                  <div
                    onDrop={handleDrop}
                    onDragOver={noopDragOver}
                    onClick={() => inputRef.current?.click()}
                    className="flex items-center justify-center w-full h-20 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 hover:border-indigo-400 cursor-pointer transition-colors"
                  >
                    <div className="flex flex-col items-center gap-1 text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-xs">Arrastra imágenes aquí o haz clic para seleccionar</span>
                    </div>
                  </div>
                )}
              </div>

              {ordered.length === 0 && (
                <p className="text-xs text-slate-400 mt-2">No hay imágenes. Arrastra o haz clic arriba para agregar.</p>
              )}
            </div>

            <div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {ordered.map((img, idx) => (
                  <div
                    key={img.key}
                    draggable
                    onDragStart={() => setDragIdx(idx)}
                    onDragOver={noopDragOver}
                    onDrop={(e) => { e.preventDefault(); moveImage(dragIdx!, idx); }}
                    className={`relative group border rounded-lg transition-colors ${
                      dragIdx === idx ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="relative aspect-square">
                      <img src={img.url} alt="" className="w-full h-full rounded object-cover cursor-grab active:cursor-grabbing" />
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-tight shadow">
                          Principal
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                        title="Eliminar"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => { if (e.target.files) addFiles(e.target.files); }}
                className="hidden"
              />

              {data.imagenes_eliminar.length > 0 && (
                <p className="text-xs text-red-400 mt-2">
                  {data.imagenes_eliminar.length} imagen(es) marcada(s) para eliminar al guardar.
                </p>
              )}
              <InputError message={errors.imagenes_nuevas} className="mt-2" />
              <InputError message={errors.imagenes_eliminar} className="mt-2" />
            </div>
          </div>
        </div>

        <div>
          <InputLabel htmlFor="precio_compra" value="Precio de Compra" required />
          <TextInput
            id="precio_compra"
            type="number"
            step="0.01"
            value={data.precio_compra}
            onChange={(e) => setData('precio_compra', e.target.value)}
            className="mt-1.5 block w-full"
          />
          <InputError message={errors.precio_compra} className="mt-2" />
        </div>

        <div>
          <InputLabel htmlFor="precio_venta" value="Precio de Venta" required />
          <TextInput
            id="precio_venta"
            type="number"
            step="0.01"
            value={data.precio_venta}
            onChange={(e) => setData('precio_venta', e.target.value)}
            className="mt-1.5 block w-full"
          />
          <InputError message={errors.precio_venta} className="mt-2" />
        </div>

        <div>
          <InputLabel htmlFor="stock_actual" value="Stock Actual" required />
          <TextInput
            id="stock_actual"
            type="number"
            step="0.01"
            value={data.stock_actual}
            onChange={(e) => setData('stock_actual', Number(e.target.value))}
            className="mt-1.5 block w-full"
          />
          <InputError message={errors.stock_actual} className="mt-2" />
        </div>

        <div>
          <InputLabel htmlFor="stock_minimo" value="Stock Mínimo" required />
          <TextInput
            id="stock_minimo"
            type="number"
            step="0.01"
            value={data.stock_minimo}
            onChange={(e) => setData('stock_minimo', Number(e.target.value))}
            className="mt-1.5 block w-full"
          />
          <InputError message={errors.stock_minimo} className="mt-2" />
        </div>

        <div>
          <InputLabel htmlFor="unidad_medida" value="Unidad de Medida" required />
          <select
            id="unidad_medida"
            value={data.unidad_medida}
            onChange={(e) => setData('unidad_medida', e.target.value)}
            className={selectClassName}
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
