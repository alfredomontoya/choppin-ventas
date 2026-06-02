import { Head, router, usePage } from '@inertiajs/react';
import { Card } from '@/Components/ui/Card';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

interface Props {
  qrImage: string | null;
}

export default function Index({ qrImage }: Props) {
  const { flash } = usePage().props as any;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setSending(true);
    const formData = new FormData();
    formData.append('qr_image', selectedFile);
    router.post(route('admin.qr.update'), formData, {
      onSuccess: () => {
        setSelectedFile(null);
        setPreview(null);
        setSending(false);
      },
      onError: () => {
        setSending(false);
      },
    });
  };

  return (
    <>
      <Head title="Configuración QR" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Configuración QR</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Sube la imagen QR de cobro que verán tus clientes al pagar con QR
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="QR Actual">
            <div className="flex flex-col items-center gap-4">
              {qrImage ? (
                <img
                  src={qrImage}
                  alt="QR de cobro"
                  className="w-64 h-64 object-contain border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-400 text-sm">
                  Sin QR configurado
                </div>
              )}
              <p className="text-xs text-slate-400 text-center">
                Este QR se mostrará en la pantalla de pago para que el cliente lo escanee
              </p>
            </div>
          </Card>

          <Card title="Actualizar QR">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Selecciona una imagen QR (PNG o JPG, máx 2MB)
                </label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 dark:file:bg-indigo-900/30 file:text-indigo-600 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/50"
                />
              </div>

              {preview && (
                <div className="flex flex-col items-center gap-2">
                  <p className="text-sm text-slate-500">Vista previa:</p>
                  <img
                    src={preview}
                    alt="Vista previa QR"
                    className="w-48 h-48 object-contain border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                {preview && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreview(null);
                      if (fileRef.current) fileRef.current.value = '';
                    }}
                    className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!selectedFile || sending}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-50"
                >
                  {sending ? 'Subiendo...' : 'Guardar QR'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}

Index.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
