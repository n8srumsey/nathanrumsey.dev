import { useState, useEffect, useMemo } from 'react';
import { navigate } from '../utils/filterSort';
import GitHubIcon from './GitHubIcon';
import GlobeIcon from './GlobeIcon';
import ChevronRightIcon from './ChevronRightIcon';
import LayersIcon from './LayersIcon';
import ArticleIcon from './ArticleIcon';
import IconLink from './IconLink';
import TagList from './TagList';

export type ProjectData = {
  slug: string;
  name: string;
  description: string;
  tags: string[];
  featured: boolean;
  repoUrl?: string;
  liveUrl?: string;
  hasDetailPage: boolean;
  relatedSeries?: { slug: string; name: string };
  relatedPosts: { slug: string; title: string }[];
};

type ProjectSort = 'featured' | 'az' | 'za';
type TagMatch = 'and' | 'or';

interface ProjectFilters {
  tags: string[];
  match: TagMatch;
  source: boolean;
  live: boolean;
  detail: boolean;
  featured: boolean;
  blog: boolean;
  sort: ProjectSort;
}

const DEFAULTS: ProjectFilters = {
  tags: [], match: 'or', source: false, live: false, detail: false, featured: false, blog: false, sort: 'featured',
};

function readFromURL(): ProjectFilters {
  const p = new URLSearchParams(window.location.search);
  return {
    tags: p.getAll('tag'),
    match: (p.get('match') as TagMatch) ?? 'or',
    source: p.get('source') === 'true',
    live: p.get('live') === 'true',
    detail: p.get('detail') === 'true',
    featured: p.get('featured') === 'true',
    blog: p.get('blog') === 'true',
    sort: (p.get('sort') as ProjectSort) ?? 'featured',
  };
}

function toSearch(f: ProjectFilters): string {
  const p = new URLSearchParams();
  f.tags.forEach(t => p.append('tag', t));
  if (f.match !== 'or') p.set('match', f.match);
  if (f.source) p.set('source', 'true');
  if (f.live) p.set('live', 'true');
  if (f.detail) p.set('detail', 'true');
  if (f.featured) p.set('featured', 'true');
  if (f.blog) p.set('blog', 'true');
  if (f.sort !== 'featured') p.set('sort', f.sort);
  return p.toString();
}

function applyFilters(projects: ProjectData[], f: ProjectFilters): ProjectData[] {
  return projects
    .filter(project => {
      if (f.tags.length > 0) {
        const matches = f.match === 'and'
          ? f.tags.every(t => project.tags.includes(t))
          : f.tags.some(t => project.tags.includes(t));
        if (!matches) return false;
      }
      if (f.source && !project.repoUrl) return false;
      if (f.live && !project.liveUrl) return false;
      if (f.detail && !project.hasDetailPage) return false;
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

const selectClass = 'font-mono text-xs border border-border rounded px-2 py-1 bg-surface text-foreground';

const toggleBtnClass = (active: boolean) =>
  `font-mono text-xs px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
    active
      ? 'bg-primary-subtle border-primary text-primary'
      : 'bg-surface border-border text-muted-foreground hover:border-primary/40'
  }`;

export default function ProjectIndexFilter({ projects }: { projects: ProjectData[] }) {
  const [filters, setFilters] = useState<ProjectFilters>(DEFAULTS);

  useEffect(() => {
    const sync = () => setFilters(readFromURL());
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  const set = (patch: Partial<ProjectFilters>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    navigate(toSearch(next));
  };

  const clearFilters = () =>
    set({ tags: [], match: 'or', source: false, live: false, detail: false, featured: false, blog: false });

  const allTags = useMemo(() => [...new Set(projects.flatMap(p => p.tags))].sort(), [projects]);
  const results = useMemo(() => applyFilters(projects, filters), [projects, filters]);

  const hasFilters =
    filters.tags.length > 0 || filters.source || filters.live || filters.detail || filters.featured || filters.blog;

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
        <h1 className="text-2xl font-bold">Projects</h1>
        <div className="flex items-center gap-2">
          <label className="font-mono text-xs text-muted-foreground" htmlFor="projects-sort">Sort</label>
          <select
            id="projects-sort"
            value={filters.sort}
            onChange={e => set({ sort: e.target.value as ProjectSort })}
            className={selectClass}
          >
            <option value="featured">Featured first</option>
            <option value="az">A → Z</option>
            <option value="za">Z → A</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-4 p-3 border border-border rounded-lg bg-surface">
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={toggleBtnClass(filters.tags.includes(tag))}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {filters.tags.length > 1 && (
            <select aria-label="Tag matching mode" value={filters.match} onChange={e => set({ match: e.target.value as TagMatch })} className={selectClass}>
              <option value="or">Match any tag</option>
              <option value="and">Match all tags</option>
            </select>
          )}
          <button onClick={() => set({ source: !filters.source })} className={toggleBtnClass(filters.source)}>
            Source available
          </button>
          <button onClick={() => set({ live: !filters.live })} className={toggleBtnClass(filters.live)}>
            Live site
          </button>
          <button onClick={() => set({ detail: !filters.detail })} className={toggleBtnClass(filters.detail)}>
            Has detail page
          </button>
          <button onClick={() => set({ featured: !filters.featured })} className={toggleBtnClass(filters.featured)}>
            Featured
          </button>
          <button onClick={() => set({ blog: !filters.blog })} className={toggleBtnClass(filters.blog)}>
            Has blog content
          </button>
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
          {filters.source && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-surface border border-border rounded-full">
              source available
              <button onClick={() => set({ source: false })} aria-label="Remove source filter" className="hover:text-primary cursor-pointer">×</button>
            </span>
          )}
          {filters.live && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-surface border border-border rounded-full">
              live site
              <button onClick={() => set({ live: false })} aria-label="Remove live filter" className="hover:text-primary cursor-pointer">×</button>
            </span>
          )}
          {filters.detail && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-surface border border-border rounded-full">
              has detail page
              <button onClick={() => set({ detail: false })} aria-label="Remove detail filter" className="hover:text-primary cursor-pointer">×</button>
            </span>
          )}
          {filters.featured && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-surface border border-border rounded-full">
              featured
              <button onClick={() => set({ featured: false })} aria-label="Remove featured filter" className="hover:text-primary cursor-pointer">×</button>
            </span>
          )}
          {filters.blog && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-surface border border-border rounded-full">
              has blog content
              <button onClick={() => set({ blog: false })} aria-label="Remove blog filter" className="hover:text-primary cursor-pointer">×</button>
            </span>
          )}
          <button onClick={clearFilters} className="underline hover:text-primary transition-colors ml-1">
            Clear all
          </button>
        </div>
      )}

      {results.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground space-y-3">
          <p>No projects match the current filters.</p>
          <button onClick={clearFilters} className="font-mono text-xs underline hover:text-primary transition-colors">
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map(project => (
            <ProjectCard key={project.slug} project={project} onTagClick={filterByTag} activeTags={filters.tags} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, onTagClick, activeTags }: { project: ProjectData; onTagClick: (tag: string) => void; activeTags: string[] }) {
  const href = project.hasDetailPage
    ? `/projects/${project.slug}`
    : (project.liveUrl ?? project.repoUrl ?? '#');
  const isExternal = !project.hasDetailPage && href !== '#';

  return (
    <article className="border border-border rounded-lg p-5 hover:border-primary/40 bg-surface-raised shadow-md transition-colors relative group">
      {project.hasDetailPage && (
        <a
          href={`/projects/${project.slug}`}
          className="absolute inset-0 rounded-lg"
          aria-hidden="true"
          tabIndex={-1}
        />
      )}
      <div className="relative flex items-start justify-between gap-4 pointer-events-none">
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold font-mono text-sm">
            {href !== '#' ? (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="hover:underline pointer-events-auto"
              >
                {project.name}
              </a>
            ) : project.name}
          </h2>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{project.description}</p>
          {project.tags.length > 0 && (
            <TagList tags={project.tags} activeTags={activeTags} onTagClick={onTagClick} />
          )}
          {(project.repoUrl || project.liveUrl || project.relatedSeries || project.relatedPosts.length > 0) && (
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 font-mono text-xs text-muted-foreground">
              {project.repoUrl && (
                <IconLink href={project.repoUrl} Icon={GitHubIcon} label="Source" external />
              )}
              {project.liveUrl && (
                <IconLink href={project.liveUrl} Icon={GlobeIcon} label="Live" external />
              )}
              {project.relatedSeries && (
                <IconLink href={`/blog/series/${project.relatedSeries.slug}`} Icon={LayersIcon} label="Blog Series" />
              )}
              {project.relatedPosts.map(post => (
                <IconLink key={post.slug} href={`/blog/${post.slug}`} Icon={ArticleIcon} label="Blog Post" />
              ))}
            </div>
          )}
        </div>
        {project.featured && (
          <span className="font-mono text-xs text-primary shrink-0">featured</span>
        )}
      </div>
      {project.hasDetailPage && (
        <a
          href={`/projects/${project.slug}`}
          className="absolute bottom-3.5 right-4 flex items-center gap-0.5 font-mono text-xs text-muted-foreground group-hover:text-primary group-hover:font-medium transition-colors"
          aria-hidden="true"
          tabIndex={-1}
        >
          Read more
          <ChevronRightIcon />
        </a>
      )}
    </article>
  );
}

