import { useState, useEffect, useMemo } from 'react';
import { navigate } from '../utils/filterSort';
import LayersIcon from './LayersIcon';

export type BlogPostData = {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  series?: string;
  seriesLabel?: string;
  seriesSlug?: string;
  seriesPosition?: number;
  readingMinutes: number;
};

type BlogSort = 'newest' | 'oldest' | 'az' | 'za';
type TagMatch = 'and' | 'or';
type LengthBucket = '' | 'short' | 'medium' | 'long';
type SeriesFilter = '' | 'yes' | 'no';

interface BlogFilters {
  tags: string[];
  match: TagMatch;
  year: string;
  length: LengthBucket;
  series: SeriesFilter;
  sort: BlogSort;
}

const DEFAULTS: BlogFilters = { tags: [], match: 'or', year: '', length: '', series: '', sort: 'newest' };

function readFromURL(): BlogFilters {
  const p = new URLSearchParams(window.location.search);
  return {
    tags: p.getAll('tag'),
    match: (p.get('match') as TagMatch) ?? 'or',
    year: p.get('year') ?? '',
    length: (p.get('length') as LengthBucket) ?? '',
    series: (p.get('series') as SeriesFilter) ?? '',
    sort: (p.get('sort') as BlogSort) ?? 'newest',
  };
}

function toSearch(f: BlogFilters): string {
  const p = new URLSearchParams();
  f.tags.forEach(t => p.append('tag', t));
  if (f.match !== 'or') p.set('match', f.match);
  if (f.year) p.set('year', f.year);
  if (f.length) p.set('length', f.length);
  if (f.series) p.set('series', f.series);
  if (f.sort !== 'newest') p.set('sort', f.sort);
  return p.toString();
}

function applyFilters(posts: BlogPostData[], f: BlogFilters): BlogPostData[] {
  return posts
    .filter(post => {
      if (f.tags.length > 0) {
        const matches = f.match === 'and'
          ? f.tags.every(t => post.tags.includes(t))
          : f.tags.some(t => post.tags.includes(t));
        if (!matches) return false;
      }
      if (f.year && new Date(post.date).getFullYear().toString() !== f.year) return false;
      if (f.length === 'short' && post.readingMinutes > 2) return false;
      if (f.length === 'medium' && (post.readingMinutes < 3 || post.readingMinutes > 8)) return false;
      if (f.length === 'long' && post.readingMinutes <= 8) return false;
      if (f.series === 'yes' && !post.series) return false;
      if (f.series === 'no' && post.series) return false;
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

const selectClass = 'font-mono text-xs border border-border rounded px-2 py-1 bg-surface text-foreground';

export default function BlogIndexFilter({ posts }: { posts: BlogPostData[] }) {
  const [filters, setFilters] = useState<BlogFilters>(DEFAULTS);

  useEffect(() => {
    const sync = () => setFilters(readFromURL());
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  const set = (patch: Partial<BlogFilters>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    navigate(toSearch(next));
  };

  const clearFilters = () => set({ tags: [], match: 'or', year: '', length: '', series: '' });

  const allTags = useMemo(() => [...new Set(posts.flatMap(p => p.tags))].sort(), [posts]);
  const allYears = useMemo(() =>
    [...new Set(posts.map(p => new Date(p.date).getFullYear()))].sort((a, b) => b - a), [posts]);
  const results = useMemo(() => applyFilters(posts, filters), [posts, filters]);

  const hasFilters = filters.tags.length > 0 || !!filters.year || !!filters.length || !!filters.series;

  const filterByTag = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      set({ tags: [...filters.tags, tag] });
    }
  };

  const toggleTag = (tag: string) => {
    const next = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    set({ tags: next });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Blog</h1>
        <div className="flex items-center gap-2">
          <label className="font-mono text-xs text-muted-foreground" htmlFor="blog-sort">Sort</label>
          <select
            id="blog-sort"
            value={filters.sort}
            onChange={e => set({ sort: e.target.value as BlogSort })}
            className={selectClass}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="az">A → Z</option>
            <option value="za">Z → A</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-4 p-3 border border-border rounded-lg bg-surface">
        <div className="flex flex-wrap gap-1.5">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`font-mono text-xs px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
                filters.tags.includes(tag)
                  ? 'bg-primary-subtle border-primary text-primary'
                  : 'bg-surface border-border text-muted-foreground hover:border-primary/40'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {filters.tags.length > 1 && (
            <select aria-label="Tag matching mode" value={filters.match} onChange={e => set({ match: e.target.value as TagMatch })} className={selectClass}>
              <option value="or">Match any tag</option>
              <option value="and">Match all tags</option>
            </select>
          )}
          <select aria-label="Filter by year" value={filters.year} onChange={e => set({ year: e.target.value })} className={selectClass}>
            <option value="">All years</option>
            {allYears.map(y => <option key={y} value={String(y)}>{y}</option>)}
          </select>
          <select aria-label="Filter by reading length" value={filters.length} onChange={e => set({ length: e.target.value as LengthBucket })} className={selectClass}>
            <option value="">Any length</option>
            <option value="short">Short (≤2 min)</option>
            <option value="medium">Medium (3–8 min)</option>
            <option value="long">Long (&gt;8 min)</option>
          </select>
          <select aria-label="Filter by series" value={filters.series} onChange={e => set({ series: e.target.value as SeriesFilter })} className={selectClass}>
            <option value="">All posts</option>
            <option value="yes">In a series</option>
            <option value="no">Standalone</option>
          </select>
        </div>
      </div>

      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-4 font-mono text-xs text-muted-foreground">
          <span>Filters:</span>
          {filters.tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-primary-subtle border border-primary text-primary rounded-full">
              {tag}
              <button onClick={() => set({ tags: filters.tags.filter(t => t !== tag) })} aria-label={`Remove tag: ${tag}`} className="hover:opacity-70 cursor-pointer">×</button>
            </span>
          ))}
          {filters.year && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-surface border border-border rounded-full">
              {filters.year}
              <button onClick={() => set({ year: '' })} aria-label="Remove year filter" className="hover:text-primary cursor-pointer">×</button>
            </span>
          )}
          {filters.length && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-surface border border-border rounded-full">
              {filters.length === 'short' ? '≤2 min' : filters.length === 'medium' ? '3–8 min' : '>8 min'}
              <button onClick={() => set({ length: '' })} aria-label="Remove length filter" className="hover:text-primary cursor-pointer">×</button>
            </span>
          )}
          {filters.series && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-surface border border-border rounded-full">
              {filters.series === 'yes' ? 'in series' : 'standalone'}
              <button onClick={() => set({ series: '' })} aria-label="Remove series filter" className="hover:text-primary cursor-pointer">×</button>
            </span>
          )}
          <button onClick={clearFilters} className="underline hover:text-primary transition-colors ml-1">
            Clear all
          </button>
        </div>
      )}

      {results.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground space-y-3">
          <p>No posts match the current filters.</p>
          <button onClick={clearFilters} className="font-mono text-xs underline hover:text-primary transition-colors">
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map(post => (
            <BlogPostCard key={post.slug} post={post} onTagClick={filterByTag} activeTags={filters.tags} />
          ))}
        </div>
      )}
    </div>
  );
}

function BlogPostCard({ post, onTagClick, activeTags }: { post: BlogPostData; onTagClick: (tag: string) => void; activeTags: string[] }) {
  const dateStr = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <article className="border border-border rounded-lg p-5 hover:border-primary/40 bg-surface-raised shadow-md transition-colors">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold">
            <a href={`/blog/${post.slug}`} className="hover:underline">{post.title}</a>
          </h2>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-sm text-muted-foreground mt-1">
            <time dateTime={post.date}>{dateStr}</time>
            <span aria-hidden="true">·</span>
            <span>{post.readingMinutes} min read</span>
            {post.tags.length > 0 && <span aria-hidden="true">·</span>}
            {post.tags.map(tag => (
              <button
                key={tag}
                onClick={() => onTagClick(tag)}
                className={`font-mono text-xs px-2 py-0.5 rounded-full border transition-colors cursor-pointer shadow-sm ${
                    activeTags.includes(tag)
                      ? 'bg-primary-subtle border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:bg-primary-subtle hover:border-primary hover:text-primary'
                  }`}
              >
                {tag}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{post.description}</p>
        </div>
        {post.seriesLabel && post.seriesSlug && (
          <div className="font-mono text-xs text-muted-foreground shrink-0 flex items-center gap-1">
            {post.seriesPosition != null && (
              <>
                <a href={`/blog/${post.slug}`} className="hover:text-primary transition-colors whitespace-nowrap">
                  Part {post.seriesPosition}
                </a>
                <span aria-hidden="true">·</span>
              </>
            )}
            <a href={`/blog/series/${post.seriesSlug}`} className="hover:text-primary transition-colors flex items-center gap-1">
              <LayersIcon />
              {post.seriesLabel}
            </a>
          </div>
        )}
      </div>
    </article>
  );
}
