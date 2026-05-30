interface ProductoFavorito {
  id: number;
  nombre: string;
  imagen: string | null;
  categoria?: { nombre: string } | null;
  precio_venta?: number;
}

interface FavoritosGridProps {
  productos: ProductoFavorito[];
  onAgregar: (producto: ProductoFavorito) => void;
}

export default function FavoritosGrid({ productos, onAgregar }: FavoritosGridProps) {
  if (productos.length === 0) return null;

  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
        Productos Favoritos
      </h4>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {productos.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onAgregar(p)}
            className="flex-shrink-0 w-40 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 p-2 text-left hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-sm transition-all"
          >
            <div className="w-full h-20 rounded-md bg-slate-100 dark:bg-slate-600 overflow-hidden mb-1.5">
              {p.imagen ? (
                <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                  Sin imagen
                </div>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate">{p.categoria?.nombre ?? ''}</p>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{p.nombre}</p>
            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
              Bs {Number(p.precio_venta ?? 0).toFixed(2)}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
