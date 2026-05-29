import { usePermission } from '@/hooks/usePermission';
import type { ReactNode } from 'react';

interface CanProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Can({ permission, children, fallback = null }: CanProps) {
  const { can } = usePermission();

  if (can(permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
