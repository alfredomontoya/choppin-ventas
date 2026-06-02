import { Head, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card } from '@/Components/ui/Card';
import Checkbox from '@/Components/Checkbox';
import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import toast from 'react-hot-toast';

interface CorrelativoReset {
  glosa: string;
  user_name: string;
  created_at: string;
}

interface Correlativo {
  id: number;
  tipo: string;
  ultimo: number;
  reiniciar_anual: boolean;
  year: number | null;
  ultimo_reset_en: string | null;
  resets_count: number;
  ultimo_reset: CorrelativoReset | null;
}

export default function Index({ correlativos }: { correlativos: Correlativo[] }) {
  const { flash } = usePage().props as any;
  const [resetModal, setResetModal] = useState<Correlativo | null>(null);
  const [glosa, setGlosa] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  const handleToggle = (c: Correlativo) => {
    router.put(route('admin.correlativos.update', c.id), {
      reiniciar_anual: !c.reiniciar_anual,
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const openReset = (c: Correlativo) => {
    setResetModal(c);
    setGlosa('');
  };

  const handleReset = () => {
    if (!resetModal || !glosa.trim() || glosa.trim().length < 10) return;
    setSending(true);
    router.post(route('admin.correlativos.reset', resetModal.id), {
      glosa: glosa.trim(),
    }, {
      onSuccess: () => {
        setResetModal(null);
        setGlosa('');
        setSending(false);
      },
      onError: () => {
        setSending(false);
      },
    });
  };

  return (
    <>
      <Head title="Correlativos" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Correlativos</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gestión de la numeración de comprobantes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {correlativos.map((c) => {
            const label = c.tipo === 'boleta' ? 'Boleta' : 'Factura';
            const prefix = c.tipo === 'boleta' ? 'B' : 'F';
            const currentYear = new Date().getFullYear();
            const nextNumber = c.ultimo + 1;

            return (
              <Card key={c.id} title={`${label} (${prefix})`}>
                <div className="space-y-5">
                  <div>
                    <span className="text-sm text-slate-500 dark:text-slate-400">Último número generado</span>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-1">
                      {prefix}-{c.year ?? currentYear}-{String(c.ultimo).padStart(8, '0')}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Siguiente: {prefix}-{c.year ?? currentYear}-{String(nextNumber).padStart(8, '0')}
                    </p>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={c.reiniciar_anual}
                      onChange={() => handleToggle(c)}
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Reiniciar automáticamente cada año
                    </span>
                  </label>

                  {c.reiniciar_anual && c.ultimo_reset_en && (
                    <div className="text-xs text-slate-400">
                      Último reinicio: {new Date(c.ultimo_reset_en).toLocaleDateString('es-BO')}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => openReset(c)}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                    >
                      Reiniciar numeración
                    </button>
                  </div>

                  {c.ultimo_reset && (
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 space-y-1">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Último reinicio manual
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{c.ultimo_reset.glosa}</p>
                      <p className="text-xs text-slate-400">
                        por {c.ultimo_reset.user_name} — {new Date(c.ultimo_reset.created_at).toLocaleDateString('es-BO')}
                      </p>
                    </div>
                  )}

                  {c.resets_count > 1 && (
                    <p className="text-xs text-slate-400">
                      {c.resets_count} reinicios en total
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <Transition show={resetModal !== null} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => !sending && setResetModal(null)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md rounded-xl bg-white dark:bg-slate-800 p-6 shadow-xl border border-slate-200 dark:border-slate-700">
                <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Reiniciar numeración
                </Dialog.Title>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  {resetModal && (
                    <>Se reiniciará la numeración de {resetModal.tipo === 'boleta' ? 'Boleta' : 'Factura'}.
                    El próximo número generado será {resetModal && (resetModal.tipo === 'boleta' ? 'B' : 'F')}-{new Date().getFullYear()}-00000001.</>
                  )}
                </p>

                <textarea
                  value={glosa}
                  onChange={(e) => setGlosa(e.target.value)}
                  placeholder="Motivo del reinicio (obligatorio)..."
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
                {glosa.length > 0 && glosa.length < 10 && (
                  <p className="text-xs text-red-500 mt-1">Mínimo 10 caracteres</p>
                )}

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setResetModal(null)}
                    disabled={sending}
                    className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={sending || !glosa.trim() || glosa.trim().length < 10}
                    className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm hover:bg-amber-700 disabled:opacity-50"
                  >
                    {sending ? 'Reiniciando...' : 'Reiniciar'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

Index.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
