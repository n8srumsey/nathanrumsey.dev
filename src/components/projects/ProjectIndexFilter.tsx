import { useState, useEffect, useMemo, useRef } from 'react';
import { navigate } from '../../utils/filterSort';
import ProjectCard, { type ProjectData } from './ProjectCard';
import { TagAutocomplete } from '../ui/TagAutocomplete';
import { DropdownSelect } from '../ui/DropdownSelect';
import ChevronDownIcon from '../icons/ChevronDownIcon';

export type { ProjectData };

type ProjectSort = 'featured' | 'az' | 'za';

interface ProjectFilters {
  tags: string[];
  source: boolean;
  live: boolean;
  featured: boolean;
  blog: boolean;
  sort: ProjectSort;
}

const DEFAULTS: ProjectFilters = {
  tags: [], source: false, live: false, featured: false, blog: false, sort: 'featured',
};

function readFromURL(): ProjectFilters {
  const p = new URLSearchParams(window.location.search);
  return {
    tags: p.getAll('tag'),
    source: p.get('source') === 'true',
    live: p.get('live') === 'true',
    featured: p.get('featured') === 'true',
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
  if (f.blog) p.set('blog', 'true');
  if (f.sort !== 'featured') p.set('sort', f.sort);
  return p.toString();
}

function applyFilters(projects: ProjectData[], f: ProjectFilters): ProjectData[] {
  return projects
    .filter(project => {
      if (f.tags.length > 0 && !f.tags.some(t => project.tags.includes(t))) return false;
      if (f.source && !project.repoUrl) return false;
      if (f.live && !project.liveUrl) return false;
      if (f.featured && !project.featured) return false;
      if (f.blog && !project.relatedSeries && project.relatedPosts.length === 0) return false;
      return true;
    })
    .sort((a, b) => {
      switch (f.sort) {
        case 'featured':
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return a.name.localeCompare(b.name);
        case 'az': return a.name.localeCompare(b.name);
        case 'za': return b.name.localeCompare(a.name);
      }
    });
}

const toggleBtnClass = (active: boolean) =>
  `font-mono text-xs px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
    active
      ? 'bg-primary-subtle border-primary text-primary'
      : 'bg-surface border-border text-muted-foreground hover:border-primary/40'
  }`;

const tagChip = 'flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded-full border bg-primary-subtle border-primary text-primary';

export default function ProjectIndexFilter({ projects }: { projects: ProjectData[] }) {
  const [filters, setFilters] = useState<ProjectFilters>(DEFAULTS);
  const [tagsOpen, setTagsOpen] = useState(false);
  const tagsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => setFilters(readFromURL());
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!tagsRef.current?.contains(e.target as Node)) setTagsOpen(false);
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
    set({ tags: [], source: false, live: false, featured: false, blog: false });

  const allTags = useMemo(() => [...new Set(projects.flatMap(p => p.tags))].sort(), [projects]);
  const results = useMemo(() => applyFilters(projects, filters), [projects, filters]);

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
            { value: 'featured', label: 'Featured first' },
            { value: 'az', label: 'A → Z' },
            { value: 'za', label: 'Z → A' },
          ]}
          value={filters.sort}
          onChange={val => set({ sort: val as ProjectSort })}
          ariaLabel="Sort order"
        />

        <button onClick={() => set({ source: !filters.source })} className={toggleBtnClass(filters.source)}>Source</button>
        <button onClick={() => set({ live: !filters.live })} className={toggleBtnClass(filters.live)}>Live</button>
        <button onClick={() => set({ featured: !filters.featured })} className={toggleBtnClass(filters.featured)}>Featured</button>
        <button onClick={() => set({ blog: !filters.blog })} className={toggleBtnClass(filters.blog)}>Blog</button>

        <div ref={tagsRef} className="relative">
          <button
            onClick={() => setTagsOpen(o => !o)}
            aria-expanded={tagsOpen}
            className={`font-mono text-xs px-2 py-1 rounded border transition-colors cursor-pointer flex items-center gap-1 ${
              filters.tags.length > 0
                ? 'bg-primary-subtle border-primary text-primary'
                : 'bg-surface border-border text-muted-foreground hover:border-primary/40'
            }`}
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

        <div className="flex-1" />

        <button
          onClick={clearFilters}
          className="font-mono text-xs text-muted-foreground underline hover:text-primary transition-colors cursor-pointer"
        >
          Clear Filters
        </button>
      </div>

      {/* Line 2: active tag chips */}
      {filters.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          {filters.tags.map(tag => (
            <span key={tag} className={tagChip}>
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
          <p>No projects match the current filters.</p>
          <button
            onClick={clearFilters}
            className="font-mono text-xs underline hover:text-primary transition-colors cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map(project => (
            <ProjectCard key={project.slug} project={project} onTagClick={addTag} activeTags={filters.tags} />
          ))}
        </div>
      )}
    </div>
  );
}
