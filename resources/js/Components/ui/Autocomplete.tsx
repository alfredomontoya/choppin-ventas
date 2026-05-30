import { useState, useRef, useEffect, useCallback } from 'react';

interface BaseItem {
  id: number;
}

interface AutocompleteProps<T extends BaseItem> {
  items: T[];
  placeholder?: string;
  filterFn: (item: T, query: string) => boolean;
  renderItem: (item: T, highlighted: boolean) => React.ReactNode;
  onSelect: (item: T) => void;
  inputClassName?: string;
  dropdownClassName?: string;
}

export default function Autocomplete<T extends BaseItem>({
  items,
  placeholder = 'Buscar...',
  filterFn,
  renderItem,
  onSelect,
  inputClassName = '',
  dropdownClassName = '',
}: AutocompleteProps<T>) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = query ? items.filter((item) => filterFn(item, query)) : [];

  const reset = useCallback(() => {
    setQuery('');
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, []);

  const handleSelect = (item: T) => {
    onSelect(item);
    reset();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
        handleSelect(filtered[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) setHighlightedIndex(-1);
  }, [isOpen]);

  useEffect(() => {
    if (highlightedIndex < 0 || !listRef.current) return;
    const el = listRef.current.children[highlightedIndex] as HTMLElement;
    el?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => query && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={inputClassName}
      />
      {isOpen && filtered.length > 0 && (
        <div
          ref={listRef}
          className={`absolute z-50 mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg max-h-60 overflow-y-auto ${dropdownClassName}`}
        >
          {filtered.map((item, i) => (
            <div
              key={item.id}
              onClick={() => handleSelect(item)}
              className={`cursor-pointer ${
                i === highlightedIndex
                  ? 'bg-indigo-50 dark:bg-indigo-900/30'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              {renderItem(item, i === highlightedIndex)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
