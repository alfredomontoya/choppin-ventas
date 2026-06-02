import { usePage, router } from '@inertiajs/react';
import { usePermission } from '@/hooks/usePermission';
import { useEffect, useRef, useState, useMemo } from 'react';

interface Command {
  name: string;
  category: string;
  icon: string;
  route: string;
  routeParams?: Record<string, any>;
  permission?: string | null;
}

const allCommands: Command[] = [
  { category: 'Páginas', name: 'Dashboard', icon: '◻', route: 'dashboard', permission: null },
  { category: 'Páginas', name: 'Ventas', icon: '🛒', route: 'ventas.index', permission: 'ventas.ver' },
  { category: 'Páginas', name: 'Compras', icon: '📦', route: 'compras.index', permission: 'compras.ver' },
  { category: 'Páginas', name: 'Clientes', icon: '👥', route: 'clientes.index', permission: 'clientes.ver' },
  { category: 'Páginas', name: 'Productos', icon: '📦', route: 'productos.index', permission: 'productos.ver' },
  { category: 'Páginas', name: 'Categorías', icon: '🏷️', route: 'categoria_productos.index', permission: 'productos.ver' },
  { category: 'Páginas', name: 'Proveedores', icon: '🚚', route: 'proveedores.index', permission: 'proveedores.ver' },
  { category: 'Páginas', name: 'Almacén', icon: '🏭', route: 'almacen.index', permission: 'almacen.ver' },
  { category: 'Acciones', name: 'Nueva Venta', icon: '➕', route: 'ventas.create', routeParams: { return_url: typeof window !== 'undefined' ? window.location.href : '/' }, permission: 'ventas.crear' },
  { category: 'Acciones', name: 'Nuevo Producto', icon: '➕', route: 'productos.create', permission: 'productos.crear' },
  { category: 'Acciones', name: 'Nuevo Cliente', icon: '➕', route: 'clientes.create', permission: 'clientes.crear' },
  { category: 'Acciones', name: 'Nueva Compra', icon: '➕', route: 'compras.create', routeParams: { return_url: typeof window !== 'undefined' ? window.location.href : '/' }, permission: 'compras.crear' },
  { category: 'Acciones', name: 'Nuevo Proveedor', icon: '➕', route: 'proveedores.create', permission: 'proveedores.crear' },
  { category: 'Acciones', name: 'Nuevo Movimiento', icon: '➕', route: 'almacen.create', permission: 'almacen.crear' },
  { category: 'Reportes', name: 'Reporte de Ventas', icon: '📊', route: 'reportes.ventas', permission: 'reportes.ver' },
  { category: 'Reportes', name: 'Reporte de Compras', icon: '📊', route: 'reportes.compras', permission: 'reportes.ver' },
  { category: 'Reportes', name: 'Rentabilidad', icon: '📊', route: 'reportes.rentabilidad', permission: 'reportes.ver' },
  { category: 'Reportes', name: 'Movimientos', icon: '📊', route: 'reportes.movimientos', permission: 'reportes.ver' },
  { category: 'Reportes', name: 'Clientes', icon: '📊', route: 'reportes.clientes', permission: 'reportes.ver' },
  { category: 'Admin', name: 'Usuarios', icon: '👤', route: 'admin.usuarios.index', permission: 'usuarios.ver' },
  { category: 'Admin', name: 'Roles', icon: '🔐', route: 'admin.roles.index', permission: 'usuarios.ver' },
];

export default function CommandPalette() {
  const { can } = usePermission();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commands = useMemo(
    () => allCommands.filter((cmd) => !cmd.permission || can(cmd.permission)),
    [can],
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return commands;
    return commands.filter(
      (cmd) =>
        cmd.name.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q),
    );
  }, [query, commands]);

  const grouped = useMemo(() => {
    const result: { category: string; items: Command[] }[] = [];
    const seen = new Set<string>();
    for (const cmd of filtered) {
      if (!seen.has(cmd.category)) {
        seen.add(cmd.category);
        result.push({ category: cmd.category, items: [cmd] });
      } else {
        result[result.length - 1].items.push(cmd);
      }
    }
    return result;
  }, [filtered]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const navigate = (cmd: Command) => {
    setOpen(false);
    setQuery('');
    router.get(route(cmd.route as any, cmd.routeParams));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIdx]) {
      e.preventDefault();
      navigate(filtered[selectedIdx]);
    }
  };

  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.querySelector('[data-selected="true"]');
      selected?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIdx]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full lg:w-64 flex items-center gap-2 pl-3 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500 transition-colors text-left"
      >
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="flex-1">Buscar...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400 font-medium">
          <span className="text-[10px]">⌘</span>K
        </kbd>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
            <div
              className="w-full max-w-lg mx-4 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 px-4 border-b border-slate-200 dark:border-slate-700">
                <svg className="w-5 h-5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Buscar páginas, acciones..."
                  className="flex-1 py-3.5 bg-transparent text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400 outline-none"
                />
                <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 font-medium">
                  ESC
                </kbd>
              </div>

              <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
                {grouped.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-slate-400">
                    Sin resultados para <span className="font-medium text-slate-600 dark:text-slate-300">"{query}"</span>
                  </p>
                ) : (
                  grouped.map((group) => {
                    const groupStartIdx = filtered.indexOf(group.items[0]);
                    return (
                      <div key={group.category}>
                        <p className="px-4 py-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          {group.category}
                        </p>
                        {group.items.map((cmd, i) => {
                          const globalIdx = groupStartIdx + i;
                          return (
                            <button
                              key={`${cmd.category}-${cmd.name}`}
                              data-selected={globalIdx === selectedIdx}
                              onClick={() => navigate(cmd)}
                              onMouseEnter={() => setSelectedIdx(globalIdx)}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                                globalIdx === selectedIdx
                                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                              }`}
                            >
                              <span className="text-base shrink-0">{cmd.icon}</span>
                              <span>{cmd.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
