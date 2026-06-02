import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, useMemo, useState } from 'react';
import { usePermission } from '@/hooks/usePermission';
import CommandPalette from '@/Components/CommandPalette';
import NotificationsDropdown from '@/Components/NotificationsDropdown';

export default function DashboardLayout({ children }: PropsWithChildren) {
  const { auth } = usePage().props;
  const user = auth.user;
  const { can } = usePermission();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(true);
  const [configOpen, setConfigOpen] = useState(true);

  const allNav = useMemo(() => [
    { name: 'Dashboard', href: route('dashboard'), icon: '◻', permission: null as string | null },
    { name: 'Ventas', href: route('ventas.index'), icon: '🛒', permission: 'ventas.ver' },
    { name: 'Compras', href: route('compras.index'), icon: '📦', permission: 'compras.ver' },
    { name: 'Clientes', href: route('clientes.index'), icon: '👥', permission: 'clientes.ver' },
    { name: 'Productos', href: route('productos.index'), icon: '📦', permission: 'productos.ver' },
    { name: 'Categorías', href: route('categoria_productos.index'), icon: '🏷️', permission: 'productos.ver' },
    { name: 'Proveedores', href: route('proveedores.index'), icon: '🚚', permission: 'proveedores.ver' },
    { name: 'Almacén', href: route('almacen.index'), icon: '🏭', permission: 'almacen.ver' },
    { name: 'Reportes', href: route('reportes.index'), icon: '📊', permission: 'reportes.ver' },
  ], []);

  const navigation = useMemo(
    () => allNav.filter((item) => !item.permission || can(item.permission)),
    [allNav, can],
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Topbar */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center h-16 px-4 lg:px-6 gap-2 sm:gap-4">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 flex-shrink-0"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <img src="/shopp.png" alt="Choppín" className="h-8 w-auto" />
            <span className="hidden sm:inline font-bold text-slate-800 dark:text-white">Choppín</span>
          </Link>

          <div className="hidden lg:block flex-1" />

          <div className="flex-1 lg:flex-none">
            <CommandPalette />
          </div>

          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <NotificationsDropdown />

            <div className="relative flex items-center gap-3 pl-2 sm:pl-4 border-l border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-medium">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 block leading-tight">
                    {user?.name || 'Usuario'}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 block leading-tight">
                    {auth.roles?.[0] || ''}
                  </span>
                </div>
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
        transition-all duration-200 overflow-y-auto
        ${sidebarOpen ? 'w-64' : 'w-16'}
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <nav className="p-3 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileSidebarOpen(false)}
              title={!sidebarOpen ? item.name : undefined}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap"
            >
              <span className="text-lg shrink-0">{item.icon}</span>
              <span className={`overflow-hidden transition-all duration-200 ${sidebarOpen ? 'opacity-100 max-w-40' : 'opacity-0 max-w-0'}`}>
                {item.name}
              </span>
            </Link>
          ))}

          {/* Admin submenu */}
          {can('usuarios.ver') && (sidebarOpen ? (
            <div>
              <button
                onClick={() => setAdminOpen(!adminOpen)}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap"
              >
                <span className="text-lg shrink-0">⚙</span>
                <span className="flex items-center justify-between flex-1">
                  Admin
                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${adminOpen ? 'rotate-90' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
              {adminOpen && (
                <div className="ml-3 mt-1 space-y-1 border-l border-slate-200 dark:border-slate-700 pl-3">
                  <Link
                    href={route('admin.usuarios.index')}
                    onClick={() => setMobileSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    👤 Usuarios
                  </Link>
                  <Link
                    href={route('admin.roles.index')}
                    onClick={() => setMobileSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    🔐 Roles
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <Link
              href={route('admin.usuarios.index')}
              onClick={() => setMobileSidebarOpen(false)}
              title="Admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap"
            >
              <span className="text-lg shrink-0">⚙</span>
            </Link>
          ))}

          {/* Configuración submenu */}
          {can('configuracion.ver') && (sidebarOpen ? (
            <div>
              <button
                onClick={() => setConfigOpen(!configOpen)}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap"
              >
                <span className="text-lg shrink-0">⚙</span>
                <span className="flex items-center justify-between flex-1">
                  Configuración
                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${configOpen ? 'rotate-90' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
              {configOpen && (
                <div className="ml-3 mt-1 space-y-1 border-l border-slate-200 dark:border-slate-700 pl-3">
                  <Link
                    href={route('admin.correlativos.index')}
                    onClick={() => setMobileSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    🔢 Correlativos
                  </Link>
                  <Link
                    href={route('admin.qr.index')}
                    onClick={() => setMobileSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    📱 QR
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <Link
              href={route('admin.correlativos.index')}
              onClick={() => setMobileSidebarOpen(false)}
              title="Configuración"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap"
            >
              <span className="text-lg shrink-0">⚙</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Desktop toggle button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="hidden lg:flex fixed top-[96px] z-30 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 shadow-sm transition-colors"
        style={{ left: sidebarOpen ? 'calc(16rem - 12px)' : 'calc(4rem - 12px)' }}
      >
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${sidebarOpen ? '' : 'rotate-180'}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Main Content */}
      <main className={`pt-16 transition-all duration-200 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
