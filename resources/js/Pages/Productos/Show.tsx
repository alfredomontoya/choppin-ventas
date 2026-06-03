import { Head, Link, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card } from '@/Components/ui/Card';
import { getReturnUrl, saveReturnUrl } from '@/lib/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const initials = (name: string) => name.slice(0, 2).toUpperCase();
const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-purple-500', 'bg-teal-500', 'bg-pink-500'];

export default function Show({ producto, esAdmin }: { producto: any; esAdmin?: boolean }) {
  const { flash } = usePage().props as any;
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const goBack = () => {
    router.visit(getReturnUrl(route('productos.index')));
  };

  const vigente = (() => {
    if (!producto.precios?.length) return null;
    const hoy = new Date().toISOString().slice(0, 10);
    const d = (v: string) => (v ?? '').slice(0, 10);
    return producto.precios
      .filter((p: any) => d(p.fecha_inicio) <= hoy && (!p.fecha_fin || d(p.fecha_fin) >= hoy))
      .sort((a: any, b: any) => b.fecha_inicio.localeCompare(a.fecha_inicio))[0] ?? null;
  })();

  const currency = (n: number) => {
    if (n == null || isNaN(n)) return '—';
    return `Bs ${Number(n).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const fields = [
    { label: 'Código', value: producto.codigo },
    { label: 'Nombre', value: producto.nombre },
    { label: 'Categoría', value: producto.categoria?.nombre ?? '—' },
    { label: 'Descripción', value: producto.descripcion || '—' },
    { label: 'Precio de Compra', value: currency(vigente?.precio_compra) },
    { label: 'Precio de Venta', value: currency(vigente?.precio_venta) },
    { label: 'Stock Actual', value: producto.stock_actual },
    { label: 'Stock Mínimo', value: producto.stock_minimo },
    { label: 'Unidad de Medida', value: producto.unidad_medida },
    { label: 'Estado', value: producto.activo ? 'Activo' : 'Inactivo' },
  ];

  const fallbackColor = colors[(producto.nombre || '').length % colors.length];
  const allImages = (producto.imagenes || []).map((img: any, i: number) => ({ ruta: img.ruta, esPrincipal: i === 0 }));

  return (
    <>
      <Head title={`Producto: ${producto.nombre}`} />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{producto.nombre}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Detalles del producto</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={goBack}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Volver
            </button>
            <Link
              href={route('productos.edit', producto.id)}
              onClick={() => saveReturnUrl()}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              Editar
            </Link>
            <Link
              href={route('productos.create')}
              onClick={() => saveReturnUrl()}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
            >
              + Nuevo Producto
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Imágenes</h2>
              {allImages.length === 0 ? (
                <div className={`w-full aspect-square rounded-xl ${fallbackColor} flex items-center justify-center`}>
                  <span className="text-white text-5xl font-bold">{initials(producto.nombre || '?')}</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {allImages.map((img: { ruta: string; esPrincipal: boolean }, i: number) => (
                    <div
                      key={i}
                      className="relative group cursor-pointer overflow-hidden rounded-lg"
                      onClick={() => setLightbox(img.ruta)}
                    >
                      <img
                        src={img.ruta}
                        alt={`${producto.nombre} ${i + 1}`}
                        className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      {img.esPrincipal && (
                        <span className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">
                          Principal
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Información del Producto</h2>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {fields.map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</dt>
                    <dd className="mt-0.5 text-sm text-slate-700 dark:text-slate-300">{value}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </div>
        </div>

        {esAdmin && producto.precios?.length > 0 && (
          <Card>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Historial de Precios</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead className="border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-slate-500 dark:text-slate-400 font-medium">Inicio</th>
                    <th className="px-4 py-3 text-left text-slate-500 dark:text-slate-400 font-medium">Fin</th>
                    <th className="px-4 py-3 text-right text-slate-500 dark:text-slate-400 font-medium">Compra</th>
                    <th className="px-4 py-3 text-right text-slate-500 dark:text-slate-400 font-medium">Venta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {[...producto.precios]
                    .sort((a: any, b: any) => b.fecha_inicio.localeCompare(a.fecha_inicio))
                    .map((p: any) => {
                      const esVigente = (() => {
                        const hoy = new Date().toISOString().slice(0, 10);
                        const d = (v: string) => (v ?? '').slice(0, 10);
                        return d(p.fecha_inicio) <= hoy && (!p.fecha_fin || d(p.fecha_fin) >= hoy);
                      })();
                      return (
                        <tr key={p.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${esVigente ? 'bg-emerald-50 dark:bg-emerald-900/10' : ''}`}>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">{p.fecha_inicio}</td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">{p.fecha_fin || '—'}</td>
                          <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 whitespace-nowrap">{currency(p.precio_compra)}</td>
                          <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 whitespace-nowrap">{currency(p.precio_venta)}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img src={lightbox} alt="Producto" className="max-w-full max-h-[90vh] rounded-lg object-contain" />
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}

Show.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
