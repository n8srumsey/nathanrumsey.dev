import { useState, useEffect, useMemo, useRef } from 'react';
import { navigate } from '../../utils/filterUrl';
import {
  parseFiltersFromSearch,
  filtersToSearch,
  type BlogFilters,
  type BlogSort,
  type LengthBucket,
} from '../../utils/blogFilters';
import { useClickOutside } from '../../utils/useClickOutside';
import BlogPostCard, { type BlogPostData } from './BlogPostCard';
import { TagAutocomplete } from '../ui/TagAutocomplete';
import ChevronDownIcon from '../icons/ChevronDownIcon';
import { DropdownSelect } from '../ui/DropdownSelect';

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

const primaryChip = 'flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded-full border bg-primary-subtle border-primary text-primary';
const neutralChip = 'flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded-full border bg-surface border-border text-foreground';

export default function BlogIndexFilter({ posts }: { posts: BlogPostData[] }) {
  const [filters, setFilters] = useState<BlogFilters>(() => parseFiltersFromSearch(window.location.search));
  const [panelOpen, setPanelOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => setFilters(parseFiltersFromSearch(window.location.search));
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  useClickOutside(filterRef, () => setPanelOpen(false));

  const set = (patch: Partial<BlogFilters>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    navigate(filtersToSearch(next));
  };

  const clearFilters = () => set({ tags: [], year: '', length: '' });

  const allTags = useMemo(() => [...new Set(posts.flatMap(p => p.tags))].sort(), [posts]);
  const allYears = useMemo(
    () => [...new Set(posts.map(p => new Date(p.date).getFullYear()))].sort((a, b) => b - a),
    [posts],
  );
  const results = useMemo(() => applyFilters(posts, filters), [posts, filters]);

  const activeCount = filters.tags.length + (filters.year ? 1 : 0) + (filters.length ? 1 : 0);

  const addTag = (tag: string) => {
    if (!filters.tags.includes(tag)) set({ tags: [...filters.tags, tag] });
  };
  const removeTag = (tag: string) => set({ tags: filters.tags.filter(t => t !== tag) });

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

      {/* Line 2: active filter chips \u2014 non-tag first, then tags */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4 min-h-6">
        {filters.year && (
          <span className={neutralChip}>
            {filters.year}
            <button
              onClick={() => set({ year: '' })}
              aria-label="Remove year filter"
              className="hover:text-primary cursor-pointer leading-none"
            >{'\u00D7'}</button>
          </span>
        )}
        {filters.length && (
          <span className={neutralChip}>
            {lengthLabel(filters.length)}
            <button
              onClick={() => set({ length: '' })}
              aria-label="Remove length filter"
              className="hover:text-primary cursor-pointer leading-none"
            >{'\u00D7'}</button>
          </span>
        )}
        {filters.tags.map(tag => (
          <span key={tag} className={primaryChip}>
            {tag}
            <button
              onClick={() => removeTag(tag)}
              aria-label={`Remove tag: ${tag}`}
              className="hover:opacity-70 cursor-pointer leading-none"
            >{'\u00D7'}</button>
          </span>
        ))}
      </div>

      {results.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground space-y-3">
          <p>No posts match the current filters.</p>
          <button
            onClick={clearFilters}
            className="font-mono text-xs underline hover:text-primary transition-colors cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
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
