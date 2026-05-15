import { useState, useEffect, useMemo, useRef } from 'react';
import { navigate } from '../../utils/filterSort';
import ProjectCard from './ProjectCard';
import { TagAutocomplete } from '../ui/TagAutocomplete';
import { DropdownSelect } from '../ui/DropdownSelect';
import ChevronDownIcon from '../icons/ChevronDownIcon';

type ProjectSort = 'featured' | 'az' | 'za' | 'newest' | 'oldest';

interface ProjectFilters {
  tags: string[];
  source: boolean;
  live: boolean;
  featured: boolean;
  ongoing: boolean;
  blog: boolean;
  sort: ProjectSort;
}

function readFromURL(): ProjectFilters {
  const p = new URLSearchParams(window.location.search);
  return {
    tags: p.getAll('tag'),
    source: p.get('source') === 'true',
    live: p.get('live') === 'true',
    featured: p.get('featured') === 'true',
    ongoing: p.get('ongoing') === 'true',
    blog: p.get('blog') === 'true',
    sort: (p.get('sort') as ProjectSort) ?? 'featured',
  };
}

function toSearch(f: ProjectFilters): string {
  const p = new URLSearchParams();
  f.tags.forEach(t => p.append('tag', t));
  if (f.source) p.set('source', 'true');
  if (f.live) p.set('live', 'true');
  if (f.featured) p.set('featured', 'true');
  if (f.ongoing) p.set('ongoing', 'true');
  if (f.blog) p.set('blog', 'true');
  if (f.sort !== 'featured') p.set('sort', f.sort);
  return p.toString();
}

type Comparator = (a: ProjectData, b: ProjectData) => number;

function chain(...cmps: Comparator[]): Comparator {
  return (a, b) => {
    for (const cmp of cmps) {
      const result = cmp(a, b);
      if (result !== 0) return result;
    }
    return 0;
  };
}

function parseDate(val: string | undefined | null): number | null {
  if (!val) return null;
  const t = new Date(val).getTime();
  return isNaN(t) ? null : t;
}

function byFeatured(a: ProjectData, b: ProjectData): number {
  return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
}

function byEndDate(dir: 1 | -1): Comparator {
  return (a, b) => {
    const da = parseDate(a.end);
    const db = parseDate(b.end);
    if (da === null && db === null) return 0;
    if (da === null) return -dir; // no end = ongoing: newest→first, oldest→last
    if (db === null) return dir;
    return dir * (db - da);
  };
}

function byStartDate(dir: 1 | -1): Comparator {
  return (a, b) => {
    const da = parseDate(a.start);
    const db = parseDate(b.start);
    if (da === null && db === null) return 0;
    if (da === null) return 1;  // no start date → always last
    if (db === null) return -1;
    return dir * (db - da);
  };
}

function byPriority(a: ProjectData, b: ProjectData): number {
  const pa = a.resumeDisplayPriority;
  const pb = b.resumeDisplayPriority;
  if (pa == null || pb == null) return 0; // skip to alphabetic if either is absent
  return pb - pa;
}

function byName(dir: 1 | -1): Comparator {
  return (a, b) => {
    const na = a.name.toLowerCase();
    const nb = b.name.toLowerCase();
    if (na < nb) return -dir;
    if (na > nb) return dir;
    return 0;
  };
}

function buildSorter(sort: ProjectSort): Comparator {
  const date = (dir: 1 | -1): Comparator[] => [byEndDate(dir), byStartDate(dir)];
  switch (sort) {
    case 'featured': return chain(byFeatured, ...date(1), byPriority, byName(1));
    case 'newest':   return chain(...date(1), byFeatured, byPriority, byName(1));
    case 'oldest':   return chain(...date(-1), byFeatured, byPriority, byName(1));
    case 'az':       return chain(byName(1), byFeatured, ...date(1), byPriority);
    case 'za':       return chain(byName(-1), byFeatured, ...date(1), byPriority);
  }
}

function applyFilters(projects: ProjectData[], f: ProjectFilters): ProjectData[] {
  return projects
    .filter(project => {
      if (f.tags.length > 0 && !f.tags.some(t => project.tags.includes(t))) return false;
      if (f.source && !project.repoUrl) return false;
      if (f.live && !project.liveUrl) return false;
      if (f.featured && !project.featured) return false;
      if (f.ongoing && !project.ongoing) return false;
      if (f.blog && !project.relatedSeries && project.relatedPosts.length === 0) return false;
      return true;
    })
    .sort(buildSorter(f.sort));
}

const toggleBtnClass = (active: boolean) =>
  `font-mono text-xs px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
    active
      ? 'bg-primary-subtle border-primary text-primary'
      : 'bg-surface border-border text-foreground hover:bg-primary-subtle hover:border-primary hover:text-primary'
  }`;

const mobileToggleBtnClass = (active: boolean) =>
  `font-mono text-xs px-2 py-1.5 rounded border transition-colors cursor-pointer text-left ${
    active
      ? 'bg-primary-subtle border-primary text-primary'
      : 'bg-surface border-border text-foreground hover:bg-primary-subtle hover:border-primary hover:text-primary'
  }`;

const tagChip = 'flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded-full border bg-primary-subtle border-primary text-primary';

const sortOptions = [
  { value: 'featured', label: 'Featured first' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'az', label: 'A \u2192 Z' },
  { value: 'za', label: 'Z \u2192 A' },
] as const;

export default function ProjectIndexFilter({ projects }: { projects: ProjectData[] }) {
  const [filters, setFilters] = useState<ProjectFilters>(readFromURL);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const tagsRef = useRef<HTMLDivElement>(null);
  const mobileFiltersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => setFilters(readFromURL());
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!tagsRef.current?.contains(e.target as Node)) setTagsOpen(false);
      if (!mobileFiltersRef.current?.contains(e.target as Node)) setMobileFiltersOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const set = (patch: Partial<ProjectFilters>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    navigate(toSearch(next));
  };

  const clearFilters = () =>
    set({ tags: [], source: false, live: false, featured: false, ongoing: false, blog: false });

  const allTags = useMemo(() => [...new Set(projects.flatMap(p => p.tags))].sort(), [projects]);
  const results = useMemo(() => applyFilters(projects, filters), [projects, filters]);

  const addTag = (tag: string) => {
    if (!filters.tags.includes(tag)) set({ tags: [...filters.tags, tag] });
  };
  const removeTag = (tag: string) => set({ tags: filters.tags.filter(t => t !== tag) });

  const activeBinaryCount = [filters.source, filters.live, filters.featured, filters.ongoing, filters.blog].filter(Boolean).length;
  const totalMobileFilterCount = activeBinaryCount + filters.tags.length;

  return (
    <div>
      {/* Mobile toolbar (hidden at md+) */}
      <div className="flex md:hidden items-center gap-2 mb-2">
        <span className="font-mono text-xs text-muted-foreground">Sort</span>
        <DropdownSelect
          options={sortOptions as unknown as { value: string; label: string }[]}
          value={filters.sort}
          onChange={val => set({ sort: val as ProjectSort })}
          ariaLabel="Sort order"
        />

        <div ref={mobileFiltersRef} className="relative">
          <button
            onClick={() => setMobileFiltersOpen(o => !o)}
            aria-expanded={mobileFiltersOpen}
            className="font-mono text-xs px-2 py-1 rounded border border-border bg-surface text-foreground flex items-center gap-1 hover:border-primary/40 transition-colors cursor-pointer"
          >
            {totalMobileFilterCount > 0 ? `Filter (${totalMobileFilterCount})` : 'Filter'}
            <ChevronDownIcon className={mobileFiltersOpen ? 'rotate-180' : ''} />
          </button>
          {mobileFiltersOpen && (
            <div className="absolute left-0 top-full mt-1 w-64 p-3 bg-surface border border-border rounded-lg shadow-md z-10">
              <TagAutocomplete allTags={allTags} activeTags={filters.tags} onSelect={addTag} />
              <div className="my-2 border-t border-border" />
              <div className="flex flex-col gap-1.5">
                <button onClick={() => set({ source: !filters.source })} className={mobileToggleBtnClass(filters.source)}>Source Available</button>
                <button onClick={() => set({ live: !filters.live })} className={mobileToggleBtnClass(filters.live)}>Live</button>
                <button onClick={() => set({ featured: !filters.featured })} className={mobileToggleBtnClass(filters.featured)}>Featured</button>
                <button onClick={() => set({ ongoing: !filters.ongoing })} className={mobileToggleBtnClass(filters.ongoing)}>Active</button>
                <button onClick={() => set({ blog: !filters.blog })} className={mobileToggleBtnClass(filters.blog)}>Blog Content</button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1" />

        <button
          onClick={clearFilters}
          className="font-mono text-xs text-muted-foreground underline hover:text-primary transition-colors cursor-pointer"
        >
          Clear
        </button>
      </div>

      {/* Desktop toolbar (hidden below md) */}
      <div className="hidden md:flex items-center gap-2 mb-2">
        <span className="font-mono text-xs text-muted-foreground">Sort</span>
        <DropdownSelect
          options={sortOptions as unknown as { value: string; label: string }[]}
          value={filters.sort}
          onChange={val => set({ sort: val as ProjectSort })}
          ariaLabel="Sort order"
        />

        <div ref={tagsRef} className="relative">
          <button
            onClick={() => setTagsOpen(o => !o)}
            aria-expanded={tagsOpen}
            className="font-mono text-xs px-2 py-1 rounded border border-border bg-surface text-foreground flex items-center gap-1 hover:border-primary/40 transition-colors cursor-pointer"
          >
            {filters.tags.length > 0 ? `Tags (${filters.tags.length})` : 'Tags'}
            <ChevronDownIcon className={tagsOpen ? 'rotate-180' : ''} />
          </button>
          {tagsOpen && (
            <div className="absolute left-0 top-full mt-1 w-56 p-2 bg-surface border border-border rounded-lg shadow-md z-10">
              <TagAutocomplete allTags={allTags} activeTags={filters.tags} onSelect={addTag} />
            </div>
          )}
        </div>

        <button onClick={() => set({ source: !filters.source })} className={toggleBtnClass(filters.source)}>Source Available</button>
        <button onClick={() => set({ live: !filters.live })} className={toggleBtnClass(filters.live)}>Live</button>
        <button onClick={() => set({ featured: !filters.featured })} className={toggleBtnClass(filters.featured)}>Featured</button>
        <button onClick={() => set({ ongoing: !filters.ongoing })} className={toggleBtnClass(filters.ongoing)}>Active</button>
        <button onClick={() => set({ blog: !filters.blog })} className={toggleBtnClass(filters.blog)}>Blog Content</button>

        <div className="flex-1" />

        <button
          onClick={clearFilters}
          className="font-mono text-xs text-muted-foreground underline hover:text-primary transition-colors cursor-pointer"
        >
          Clear Filters
        </button>
      </div>

      {/* Active tag chips (both layouts) */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4 min-h-6">
        {filters.tags.map(tag => (
          <span key={tag} className={tagChip}>
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
          <p>No projects match the current filters.</p>
          <button
            onClick={clearFilters}
            className="font-mono text-xs underline hover:text-primary transition-colors cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {results.map(project => (
            <ProjectCard key={project.slug} project={project} onTagClick={addTag} activeTags={filters.tags} />
          ))}
        </div>
      )}
    </div>
  );
}
