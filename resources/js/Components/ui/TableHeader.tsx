interface Props {
  label: string;
  sortKey: string;
  currentSort?: string;
  currentDir?: 'asc' | 'desc';
  onSort: (key: string) => void;
}

export function TableHeader({ label, sortKey, currentSort, currentDir, onSort }: Props) {
  const isActive = currentSort === sortKey;

  return (
    <th
      className="px-4 py-3 text-left text-slate-500 dark:text-slate-400 font-medium cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-300 transition-colors whitespace-nowrap lg:whitespace-normal"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        <span className="text-xs">
          {isActive ? (currentDir === 'asc' ? '↑' : '↓') : '↕'}
        </span>
      </div>
    </th>
  );
}
