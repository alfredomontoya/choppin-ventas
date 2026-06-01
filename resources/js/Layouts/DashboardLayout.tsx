import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, useMemo, useState } from 'react';

export default function DashboardLayout({ children }: PropsWithChildren) {
  const user = usePage().props.auth.user;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navigation = useMemo(() => [
    { name: 'Dashboard', href: route('dashboard'), icon: '◻' },
    { name: 'Ventas', href: route('ventas.index'), icon: '🛒' },
    { name: 'Compras', href: route('compras.index'), icon: '📦' },
    { name: 'Clientes', href: route('clientes.index'), icon: '👥' },
    { name: 'Productos', href: route('productos.index'), icon: '📦' },
    { name: 'Categorías', href: route('categoria_productos.index'), icon: '🏷️' },
    { name: 'Proveedores', href: route('proveedores.index'), icon: '🚚' },
    { name: 'Almacén', href: route('almacen.index'), icon: '🏭' },
    { name: 'Reportes', href: '#', icon: '📊' },
    { name: 'Admin', href: '#', icon: '⚙' },
  ], []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Topbar */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <img src="/shopp.png" alt="Choppín" className="h-8 w-auto" />
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar..."
                className="w-64 pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="relative flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-medium">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:block">
                  {user?.name || 'Usuario'}
                </span>
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 z-50 w-48 rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 py-1">
                    <Link
                      href={route('profile.edit')}
                      className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      Perfil
                    </Link>
                    <Link
                      href={route('logout')}
                      method="post"
                      as="button"
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      Cerrar Sesión
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-16 left-0 z-20 h-[calc(100vh-4rem)] bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700
        transition-all duration-200
        ${sidebarOpen ? 'w-64' : 'w-16'}
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <nav className="p-3 space-y-1 overflow-y-auto max-h-full">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap"
            >
              <span className="text-lg shrink-0">{item.icon}</span>
              <span className={`overflow-hidden transition-all duration-200 ${sidebarOpen ? 'opacity-100 max-w-40' : 'opacity-0 max-w-0'}`}>
                {item.name}
              </span>
            </Link>
          ))}
        </nav>

        {/* Desktop toggle button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:flex absolute -right-3 top-8 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 shadow-sm transition-colors"
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-200 ${sidebarOpen ? '' : 'rotate-180'}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </aside>

      {/* Main Content */}
      <main className={`pt-16 transition-all duration-200 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
