interface Props {
  meta: {
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
  porPagina: number;
  onChange: (params: Record<string, any>) => void;
}

const opciones = [5, 10, 15, 50, 100];

export function Pagination({ meta, porPagina, onChange }: Props) {
  const pages = Array.from({ length: meta.last_page }, (_, i) => i + 1);
  const maxVisible = 5;
  let visiblePages = pages;
  if (pages.length > maxVisible) {
    const start = Math.max(0, meta.current_page - 3);
    const end = Math.min(pages.length, meta.current_page + 2);
    visiblePages = pages.slice(start, end);
    if (start > 0) visiblePages = [1, -1, ...visiblePages];
    if (end < pages.length) visiblePages = [...visiblePages, -1, pages.length];
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <span>Registros por página:</span>
        <select
          value={porPagina}
          onChange={(e) => onChange({ por_pagina: Number(e.target.value), page: 1 })}
          className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {opciones.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <span>
          Mostrando {meta.from ?? 0}–{meta.to ?? 0} de {meta.total} registros
        </span>
      </div>

      <div className="flex items-center gap-1">
        {visiblePages.map((page, idx) =>
          page === -1 ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onChange({ page })}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                page === meta.current_page
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {page}
            </button>
          )
        )}
      </div>
    </div>
  );
}
