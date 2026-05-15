import { useState, useEffect, useMemo } from 'react';
import { navigate } from './filterUrl';

export function useIndexFilter<
  TFilters extends { tags: string[] },
  TItem extends { tags: string[] },
>({
  parse,
  toSearch,
  clearPatch,
  items,
  applyFilters,
}: {
  parse: (search: string) => TFilters;
  toSearch: (filters: TFilters) => string;
  clearPatch: Partial<TFilters>;
  items: TItem[];
  applyFilters: (items: TItem[], filters: TFilters) => TItem[];
}) {
  const [filters, setFilters] = useState<TFilters>(() => parse(window.location.search));

  useEffect(() => {
    const sync = () => setFilters(parse(window.location.search));
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  const set = (patch: Partial<TFilters>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    navigate(toSearch(next));
  };

  const clearFilters = () => set(clearPatch);

  const allTags = useMemo(() => [...new Set(items.flatMap(p => p.tags))].sort(), [items]);
  const results = useMemo(() => applyFilters(items, filters), [items, filters]);

  const addTag = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      const next = { ...filters, tags: [...filters.tags, tag] };
      setFilters(next);
      navigate(toSearch(next));
    }
  };

  const removeTag = (tag: string) => {
    const next = { ...filters, tags: filters.tags.filter(t => t !== tag) };
    setFilters(next);
    navigate(toSearch(next));
  };

  return { filters, set, clearFilters, allTags, results, addTag, removeTag };
}
