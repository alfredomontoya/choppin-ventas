import { usePage } from '@inertiajs/react';

type PagePropsWithPermissions = {
  auth?: {
    permissions?: string[];
  };
};

export function usePermission() {
  const page = usePage();
  const props = (page.props as PagePropsWithPermissions);
  const permissions = props.auth?.permissions ?? [];

  function can(permission: string): boolean {
    return permissions.includes(permission);
  }

  function canAny(permisos: string[]): boolean {
    return permisos.some((p) => can(p));
  }

  function canAll(permisos: string[]): boolean {
    return permisos.every((p) => can(p));
  }

  return { can, canAny, canAll, permissions };
}
