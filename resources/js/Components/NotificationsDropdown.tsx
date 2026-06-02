import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

interface Notificaciones {
  stock_bajo: number;
  ordenes_pendientes: number;
  ventas_anuladas_hoy: number;
  total: number;
}

export default function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Notificaciones | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(route('notificaciones'))
      .then((r) => r.json())
      .then(setData);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open]);

  const total = data?.total ?? 0;
  const showBadge = total > 0;

  const items = [
    { label: 'Productos con stock bajo', count: data?.stock_bajo ?? 0, route: 'productos.index', icon: '⚠️', color: 'text-red-600 dark:text-red-400' },
    { label: 'Órdenes de compra pendientes', count: data?.ordenes_pendientes ?? 0, route: 'compras.index', icon: '📦', color: 'text-amber-600 dark:text-amber-400' },
    { label: 'Ventas anuladas hoy', count: data?.ventas_anuladas_hoy ?? 0, route: 'ventas.index', icon: '🚫', color: 'text-slate-500 dark:text-slate-400' },
  ];

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {showBadge && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
            {total > 99 ? '99+' : total}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 py-2">
          <p className="px-4 py-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Notificaciones
          </p>
          {total === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-400">Todo en orden, sin novedades.</p>
          ) : (
            <div className="space-y-0.5">
              {items.map((item) =>
                item.count > 0 ? (
                  <Link
                    key={item.label}
                    href={route(item.route as any)}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    <span className={`font-semibold ${item.color}`}>{item.count}</span>
                  </Link>
                ) : null
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
