import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card } from '@/Components/ui/Card';
import { Badge } from '@/Components/ui/Badge';

const moduleLabels: Record<string, string> = {
  ventas: 'Ventas',
  clientes: 'Clientes',
  productos: 'Productos',
  proveedores: 'Proveedores',
  compras: 'Compras',
  empleados: 'Empleados',
  almacen: 'Almacén',
  reportes: 'Reportes',
  usuarios: 'Usuarios',
  configuracion: 'Configuración',
};

const actionLabels: Record<string, string> = {
  ver: 'Ver',
  crear: 'Crear',
  modificar: 'Modificar',
  eliminar: 'Eliminar',
  exportar: 'Exportar',
};

interface RoleData {
  name: string;
  permissions: string[];
}

function groupPermissions(permissions: string[]) {
  const groups: Record<string, string[]> = {};

  for (const perm of permissions) {
    const [modulo] = perm.split('.');
    if (!groups[modulo]) groups[modulo] = [];
    groups[modulo].push(perm);
  }

  return Object.entries(groups)
    .map(([modulo, perms]) => ({
      modulo,
      label: moduleLabels[modulo] ?? modulo,
      permisos: perms.map((p) => {
        const action = p.split('.')[1];
        return { name: p, label: actionLabels[action] ?? action };
      }),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export default function RolesIndex({ roles }: { roles: RoleData[] }) {
  return (
    <>
      <Head title="Roles" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Roles del Sistema</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Listado de roles y sus permisos asignados
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {roles.map((role) => {
            const groups = groupPermissions(role.permissions);
            return (
              <Card key={role.name}>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <Badge variant="info">{role.name}</Badge>
                    <span className="text-xs text-slate-400">
                      {role.permissions.length} permisos en {groups.length} módulos
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {groups.map((group) => (
                      <div
                        key={group.modulo}
                        className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                      >
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          {group.label}
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {group.permisos.map((perm) => (
                            <span
                              key={perm.name}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600"
                            >
                              {perm.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}

RolesIndex.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
