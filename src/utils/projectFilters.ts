export type ProjectSort = 'featured' | 'az' | 'za' | 'newest' | 'oldest';

export type ProjectFilters = {
  tags: string[];
  source: boolean;
  live: boolean;
  featured: boolean;
  ongoing: boolean;
  blog: boolean;
  sort: ProjectSort;
};

export function parseDate(val: string | undefined | null): number | null {
  if (!val) return null;
  const t = new Date(val).getTime();
  return isNaN(t) ? null : t;
}

export function chain<T>(...cmps: Array<(a: T, b: T) => number>): (a: T, b: T) => number {
  return (a, b) => {
    for (const cmp of cmps) {
      const result = cmp(a, b);
      if (result !== 0) return result;
    }
    return 0;
  };
}

export function byFeatured(a: ProjectData, b: ProjectData): number {
  return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
}

export function byEndDate(dir: 1 | -1): (a: ProjectData, b: ProjectData) => number {
  return (a, b) => {
    const da = parseDate(a.end);
    const db = parseDate(b.end);
    if (da === null && db === null) return 0;
    if (da === null) return -dir; // null end = ongoing: newest→first, oldest→last
    if (db === null) return dir;
    return dir * (db - da);
  };
}

export function byStartDate(dir: 1 | -1): (a: ProjectData, b: ProjectData) => number {
  return (a, b) => {
    const da = parseDate(a.start);
    const db = parseDate(b.start);
    if (da === null && db === null) return 0;
    if (da === null) return 1;
    if (db === null) return -1;
    return dir * (db - da);
  };
}

export function byPriority(a: ProjectData, b: ProjectData): number {
  const pa = a.resumeDisplayPriority;
  const pb = b.resumeDisplayPriority;
  if (pa == null || pb == null) return 0;
  return pb - pa;
}

export function byName(dir: 1 | -1): (a: ProjectData, b: ProjectData) => number {
  return (a, b) => {
    const na = a.name.toLowerCase();
    const nb = b.name.toLowerCase();
    if (na < nb) return -dir;
    if (na > nb) return dir;
    return 0;
  };
}

export function buildSorter(sort: ProjectSort): (a: ProjectData, b: ProjectData) => number {
  const date = (dir: 1 | -1) => [byEndDate(dir), byStartDate(dir)] as const;
  switch (sort) {
    case 'featured': return chain(byFeatured, byPriority, ...date(1), byName(1));
    case 'newest':   return chain(...date(1), byFeatured, byPriority, byName(1));
    case 'oldest':   return chain(...date(-1), byFeatured, byPriority, byName(1));
    case 'az':       return chain(byName(1), byFeatured, ...date(1), byPriority);
    case 'za':       return chain(byName(-1), byFeatured, ...date(1), byPriority);
  }
}

export function applyFilters(projects: ProjectData[], f: ProjectFilters): ProjectData[] {
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

export function parseFiltersFromSearch(search: string): ProjectFilters {
  const p = new URLSearchParams(search);
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

export function filtersToSearch(f: ProjectFilters): string {
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
