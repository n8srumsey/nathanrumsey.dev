import { useState, useMemo, useRef } from 'react';
import {
  parseFiltersFromSearch,
  filtersToSearch,
  type BlogFilters,
  type BlogSort,
  type LengthBucket,
} from '../../utils/blogFilters';
import { useClickOutside } from '../../utils/useClickOutside';
import { useIndexFilter } from '../../utils/useIndexFilter';
import BlogPostCard, { type BlogPostData } from './BlogPostCard';
import { TagAutocomplete } from '../ui/TagAutocomplete';
import ChevronDownIcon from '../icons/ChevronDownIcon';
import { DropdownSelect } from '../ui/DropdownSelect';
import { FilterEmptyState } from '../ui/FilterEmptyState';
import { FilterChipRow, type FilterChip } from '../ui/FilterChipRow';

export type { BlogPostData };

function applyFilters(posts: BlogPostData[], f: BlogFilters): BlogPostData[] {
  return posts
    .filter(post => {
      if (f.tags.length > 0 && !f.tags.some(t => post.tags.includes(t))) return false;
      if (f.year && new Date(post.date).getFullYear().toString() !== f.year) return false;
      if (f.length === 'short' && post.readingMinutes > 2) return false;
      if (f.length === 'medium' && (post.readingMinutes < 3 || post.readingMinutes > 8)) return false;
      if (f.length === 'long' && post.readingMinutes <= 8) return false;
      return true;
    })
    .sort((a, b) => {
      switch (f.sort) {
        case 'newest': return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest': return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'az': return a.title.localeCompare(b.title);
        case 'za': return b.title.localeCompare(a.title);
      }
    });
}

const lengthLabel = (l: LengthBucket) =>
  l === 'short' ? '\u22642 min' : l === 'medium' ? '3\u20138 min' : '>8 min';

export default function BlogIndexFilter({ posts }: { posts: BlogPostData[] }) {
  const { filters, set, clearFilters, allTags, results, addTag, removeTag } = useIndexFilter({
    parse: parseFiltersFromSearch,
    toSearch: filtersToSearch,
    clearPatch: { tags: [], year: '', length: '' },
    items: posts,
    applyFilters,
  });

  const [panelOpen, setPanelOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  useClickOutside(filterRef, () => setPanelOpen(false));

  const allYears = useMemo(
    () => [...new Set(posts.map(p => new Date(p.date).getFullYear()))].sort((a, b) => b - a),
    [posts],
  );

  const activeCount = filters.tags.length + (filters.year ? 1 : 0) + (filters.length ? 1 : 0);

  const chips: FilterChip[] = [
    ...(filters.year ? [{ key: 'year', label: filters.year, ariaLabel: 'Remove year filter', onRemove: () => set({ year: '' }), variant: 'neutral' as const }] : []),
    ...(filters.length ? [{ key: 'length', label: lengthLabel(filters.length), ariaLabel: 'Remove length filter', onRemove: () => set({ length: '' }), variant: 'neutral' as const }] : []),
    ...filters.tags.map(tag => ({ key: tag, label: tag, ariaLabel: `Remove tag: ${tag}`, onRemove: () => removeTag(tag) })),
  ];

  return (
    <div>
      {/* Line 1: controls */}
      <div className="flex items-center gap-2 mb-2">
        <span className="font-mono text-xs text-muted-foreground">Sort</span>
        <DropdownSelect
          options={[
            { value: 'newest', label: 'Newest' },
            { value: 'oldest', label: 'Oldest' },
            { value: 'az', label: 'A \u2192 Z' },
            { value: 'za', label: 'Z \u2192 A' },
          ]}
          value={filters.sort}
          onChange={val => set({ sort: val as BlogSort })}
          ariaLabel="Sort order"
        />

        <div ref={filterRef} className="relative">
          <button
            onClick={() => setPanelOpen(o => !o)}
            aria-expanded={panelOpen}
            className="font-mono text-xs px-2 py-1 rounded border border-border bg-surface text-foreground flex items-center gap-1 hover:border-primary/40 transition-colors cursor-pointer"
          >
            {activeCount > 0 ? `Filter (${activeCount})` : 'Filter'}
            <ChevronDownIcon className={panelOpen ? 'rotate-180' : ''} />
          </button>

          {panelOpen && (
            <div className="absolute left-0 top-full mt-1 w-72 z-10 flex flex-col gap-2 p-3 border border-border rounded-lg bg-surface shadow-md">
              <TagAutocomplete allTags={allTags} activeTags={filters.tags} onSelect={addTag} />
              <div className="flex flex-wrap gap-2">
                <DropdownSelect
                  options={[
                    { value: '', label: 'All years' },
                    ...allYears.map(y => ({ value: String(y), label: String(y) })),
                  ]}
                  value={filters.year}
                  onChange={val => set({ year: val })}
                  ariaLabel="Filter by year"
                  sortSelectedToTop
                />
                <DropdownSelect
                  options={[
                    { value: '', label: 'Any length' },
                    { value: 'short', label: 'Short (\u22642 min)' },
                    { value: 'medium', label: 'Medium (3\u20138 min)' },
                    { value: 'long', label: 'Long (>8 min)' },
                  ]}
                  value={filters.length}
                  onChange={val => set({ length: val as LengthBucket })}
                  ariaLabel="Filter by reading length"
                  sortSelectedToTop
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1" />

        <button
          onClick={clearFilters}
          className="font-mono text-xs text-muted-foreground underline hover:text-primary transition-colors cursor-pointer"
        >
          Clear Filters
        </button>
      </div>

      <FilterChipRow chips={chips} />

      {results.length === 0 ? (
        <FilterEmptyState message="No posts match the current filters." onClear={clearFilters} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {results.map(post => (
            <BlogPostCard key={post.slug} post={post} onTagClick={addTag} activeTags={filters.tags} />
          ))}
        </div>
      )}
    </div>
  );
}
