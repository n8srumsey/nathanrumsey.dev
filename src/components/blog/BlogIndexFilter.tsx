import { useState, useEffect, useMemo, useRef } from 'react';
import { navigate } from '../../utils/filterSort';
import BlogPostCard, { type BlogPostData } from './BlogPostCard';
import { TagAutocomplete } from '../ui/TagAutocomplete';
import ChevronDownIcon from '../icons/ChevronDownIcon';
import { DropdownSelect } from '../ui/DropdownSelect';

export type { BlogPostData };

type BlogSort = 'newest' | 'oldest' | 'az' | 'za';
type LengthBucket = '' | 'short' | 'medium' | 'long';

interface BlogFilters {
  tags: string[];
  year: string;
  length: LengthBucket;
  sort: BlogSort;
}

const DEFAULTS: BlogFilters = { tags: [], year: '', length: '', sort: 'newest' };

function readFromURL(): BlogFilters {
  const p = new URLSearchParams(window.location.search);
  return {
    tags: p.getAll('tag'),
    year: p.get('year') ?? '',
    length: (p.get('length') as LengthBucket) ?? '',
    sort: (p.get('sort') as BlogSort) ?? 'newest',
  };
}

function toSearch(f: BlogFilters): string {
  const p = new URLSearchParams();
  f.tags.forEach(t => p.append('tag', t));
  if (f.year) p.set('year', f.year);
  if (f.length) p.set('length', f.length);
  if (f.sort !== 'newest') p.set('sort', f.sort);
  return p.toString();
}

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
  l === 'short' ? '≤2 min' : l === 'medium' ? '3–8 min' : '>8 min';

const selectClass = 'font-mono text-xs border border-border rounded px-2 py-1 bg-surface text-foreground';
const primaryChip = 'flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded-full border bg-primary-subtle border-primary text-primary';
const neutralChip = 'flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded-full border bg-surface border-border text-foreground';

export default function BlogIndexFilter({ posts }: { posts: BlogPostData[] }) {
  const [filters, setFilters] = useState<BlogFilters>(DEFAULTS);
  const [panelOpen, setPanelOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => setFilters(readFromURL());
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!filterRef.current?.contains(e.target as Node)) setPanelOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const set = (patch: Partial<BlogFilters>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    navigate(toSearch(next));
  };

  const clearFilters = () => set({ tags: [], year: '', length: '' });

  const allTags = useMemo(() => [...new Set(posts.flatMap(p => p.tags))].sort(), [posts]);
  const allYears = useMemo(
    () => [...new Set(posts.map(p => new Date(p.date).getFullYear()))].sort((a, b) => b - a),
    [posts],
  );
  const results = useMemo(() => applyFilters(posts, filters), [posts, filters]);

  const hasFilters = filters.tags.length > 0 || !!filters.year || !!filters.length;
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
            { value: 'az', label: 'A → Z' },
            { value: 'za', label: 'Z → A' },
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
                <select
                  aria-label="Filter by year"
                  value={filters.year}
                  onChange={e => set({ year: e.target.value })}
                  className={selectClass}
                >
                  <option value="">All years</option>
                  {allYears.map(y => <option key={y} value={String(y)}>{y}</option>)}
                </select>
                <select
                  aria-label="Filter by reading length"
                  value={filters.length}
                  onChange={e => set({ length: e.target.value as LengthBucket })}
                  className={selectClass}
                >
                  <option value="">Any length</option>
                  <option value="short">Short (≤2 min)</option>
                  <option value="medium">Medium (3–8 min)</option>
                  <option value="long">Long (&gt;8 min)</option>
                </select>
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

      {/* Line 2: active filter chips — non-tag first, then tags */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          {filters.year && (
            <span className={neutralChip}>
              {filters.year}
              <button
                onClick={() => set({ year: '' })}
                aria-label="Remove year filter"
                className="hover:text-primary cursor-pointer leading-none"
              >×</button>
            </span>
          )}
          {filters.length && (
            <span className={neutralChip}>
              {lengthLabel(filters.length)}
              <button
                onClick={() => set({ length: '' })}
                aria-label="Remove length filter"
                className="hover:text-primary cursor-pointer leading-none"
              >×</button>
            </span>
          )}
          {filters.tags.map(tag => (
            <span key={tag} className={primaryChip}>
              {tag}
              <button
                onClick={() => removeTag(tag)}
                aria-label={`Remove tag: ${tag}`}
                className="hover:opacity-70 cursor-pointer leading-none"
              >×</button>
            </span>
          ))}
        </div>
      )}

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
        <div className="space-y-4">
          {results.map(post => (
            <BlogPostCard key={post.slug} post={post} onTagClick={addTag} activeTags={filters.tags} />
          ))}
        </div>
      )}
    </div>
  );
}
