import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: { value: number; isUp: boolean };
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

const variantStyles = {
  default: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700',
  primary: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
  success: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
  warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
};

export function StatCard({ title, value, icon, trend, variant = 'default' }: StatCardProps) {
  return (
    <div className={`rounded-xl border p-5 ${variantStyles[variant]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {typeof value === 'number' ? (value as number).toLocaleString('es-PE', { minimumFractionDigits: 2 }) : value}
          </p>
          {trend && (
            <p className={`text-xs mt-1 flex items-center gap-1 ${trend.isUp ? 'text-emerald-600' : 'text-red-600'}`}>
              <span>{trend.isUp ? '↑' : '↓'}</span>
              <span>{trend.value}% vs ayer</span>
            </p>
          )}
        </div>
        {icon && (
          <div className="text-slate-400 dark:text-slate-500">{icon}</div>
        )}
      </div>
    </div>
  );
}
