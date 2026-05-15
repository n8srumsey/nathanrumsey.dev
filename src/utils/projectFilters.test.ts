import { describe, it, expect } from 'vitest';
import {
  parseDate,
  chain,
  byFeatured,
  byEndDate,
  byStartDate,
  byPriority,
  byName,
  buildSorter,
  applyFilters,
  parseFiltersFromSearch,
  filtersToSearch,
} from './projectFilters';

const base: ProjectData = {
  slug: 'test',
  name: 'Test Project',
  description: 'desc',
  tags: [],
  featured: false,
  ongoing: false,
  hasDetailPage: false,
  relatedPosts: [],
};

function project(overrides: Partial<ProjectData>): ProjectData {
  return { ...base, ...overrides };
}

// ---------------------------------------------------------------------------
// parseDate
// ---------------------------------------------------------------------------

describe('parseDate', () => {
  it('returns null for undefined', () => {
    expect(parseDate(undefined)).toBeNull();
  });

  it('returns null for null', () => {
    expect(parseDate(null)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseDate('')).toBeNull();
  });

  it('returns a timestamp for a valid YYYY-MM date', () => {
    const t = parseDate('2024-01');
    expect(t).not.toBeNull();
    expect(typeof t).toBe('number');
  });

  it('returns null for an invalid date string', () => {
    expect(parseDate('not-a-date')).toBeNull();
  });

  it('later date produces a larger timestamp', () => {
    const early = parseDate('2020-01')!;
    const late = parseDate('2024-06')!;
    expect(late).toBeGreaterThan(early);
  });
});

// ---------------------------------------------------------------------------
// chain
// ---------------------------------------------------------------------------

describe('chain', () => {
  it('returns the first non-zero comparator result', () => {
    const cmp = chain<number>(
      (a, b) => a - b,
      () => 999,
    );
    expect(cmp(1, 2)).toBe(-1);
  });

  it('falls through to the next comparator on a tie', () => {
    const cmp = chain<number>(
      () => 0,
      (a, b) => b - a,
    );
    expect(cmp(3, 5)).toBe(2);
  });

  it('returns 0 when all comparators tie', () => {
    const cmp = chain<number>(() => 0, () => 0);
    expect(cmp(1, 1)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// byFeatured
// ---------------------------------------------------------------------------

describe('byFeatured', () => {
  it('sorts featured before unfeatured', () => {
    const a = project({ featured: true });
    const b = project({ featured: false });
    expect(byFeatured(a, b)).toBeLessThan(0);
    expect(byFeatured(b, a)).toBeGreaterThan(0);
  });

  it('returns 0 when both have the same featured status', () => {
    expect(byFeatured(project({ featured: true }), project({ featured: true }))).toBe(0);
    expect(byFeatured(project({ featured: false }), project({ featured: false }))).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// byEndDate
// ---------------------------------------------------------------------------

describe('byEndDate', () => {
  it('sorts more recent end date first for dir=1', () => {
    const a = project({ end: '2024-06' });
    const b = project({ end: '2020-01' });
    expect(byEndDate(1)(a, b)).toBeLessThan(0);
  });

  it('sorts older end date first for dir=-1', () => {
    const a = project({ end: '2020-01' });
    const b = project({ end: '2024-06' });
    expect(byEndDate(-1)(a, b)).toBeLessThan(0);
  });

  it('places null end date first (ongoing) for dir=1 (newest first)', () => {
    const ongoing = project({ end: undefined });
    const finished = project({ end: '2024-01' });
    expect(byEndDate(1)(ongoing, finished)).toBeLessThan(0);
  });

  it('places null end date last for dir=-1 (oldest first)', () => {
    const ongoing = project({ end: undefined });
    const finished = project({ end: '2024-01' });
    expect(byEndDate(-1)(ongoing, finished)).toBeGreaterThan(0);
  });

  it('returns 0 when both end dates are null', () => {
    expect(byEndDate(1)(project({ end: undefined }), project({ end: undefined }))).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// byStartDate
// ---------------------------------------------------------------------------

describe('byStartDate', () => {
  it('sorts more recent start date first for dir=1', () => {
    const a = project({ start: '2024-06' });
    const b = project({ start: '2020-01' });
    expect(byStartDate(1)(a, b)).toBeLessThan(0);
  });

  it('sorts older start date first for dir=-1', () => {
    const a = project({ start: '2020-01' });
    const b = project({ start: '2024-06' });
    expect(byStartDate(-1)(a, b)).toBeLessThan(0);
  });

  it('places null start date last regardless of dir', () => {
    const noDate = project({ start: undefined });
    const hasDate = project({ start: '2024-01' });
    expect(byStartDate(1)(noDate, hasDate)).toBeGreaterThan(0);
    expect(byStartDate(-1)(noDate, hasDate)).toBeGreaterThan(0);
  });

  it('returns 0 when both start dates are null', () => {
    expect(byStartDate(1)(project({ start: undefined }), project({ start: undefined }))).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// byPriority
// ---------------------------------------------------------------------------

describe('byPriority', () => {
  it('sorts higher priority first', () => {
    const a = project({ resumeDisplayPriority: 10 });
    const b = project({ resumeDisplayPriority: 5 });
    expect(byPriority(a, b)).toBeLessThan(0);
  });

  it('returns 0 when priorities are equal', () => {
    expect(byPriority(project({ resumeDisplayPriority: 3 }), project({ resumeDisplayPriority: 3 }))).toBe(0);
  });

  it('returns 0 when either priority is absent', () => {
    expect(byPriority(project({ resumeDisplayPriority: 5 }), project({}))).toBe(0);
    expect(byPriority(project({}), project({ resumeDisplayPriority: 5 }))).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// byName
// ---------------------------------------------------------------------------

describe('byName', () => {
  it('sorts A before Z for dir=1', () => {
    const a = project({ name: 'Alpha' });
    const b = project({ name: 'Zeta' });
    expect(byName(1)(a, b)).toBeLessThan(0);
  });

  it('sorts Z before A for dir=-1', () => {
    const a = project({ name: 'Alpha' });
    const b = project({ name: 'Zeta' });
    expect(byName(-1)(a, b)).toBeGreaterThan(0);
  });

  it('is case-insensitive', () => {
    const a = project({ name: 'alpha' });
    const b = project({ name: 'ALPHA' });
    expect(byName(1)(a, b)).toBe(0);
  });

  it('returns 0 for equal names', () => {
    expect(byName(1)(project({ name: 'Same' }), project({ name: 'Same' }))).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// buildSorter
// ---------------------------------------------------------------------------

describe('buildSorter', () => {
  it('featured sort places featured projects first', () => {
    const a = project({ featured: true, name: 'A' });
    const b = project({ featured: false, name: 'B' });
    expect(buildSorter('featured')(a, b)).toBeLessThan(0);
  });

  it('newest sort places more recent end dates first', () => {
    const a = project({ end: '2024-06', name: 'A' });
    const b = project({ end: '2020-01', name: 'B' });
    expect(buildSorter('newest')(a, b)).toBeLessThan(0);
  });

  it('oldest sort places older end dates first', () => {
    const a = project({ end: '2020-01', name: 'A' });
    const b = project({ end: '2024-06', name: 'B' });
    expect(buildSorter('oldest')(a, b)).toBeLessThan(0);
  });

  it('az sort is alphabetical', () => {
    const a = project({ name: 'Alpha' });
    const b = project({ name: 'Zeta' });
    expect(buildSorter('az')(a, b)).toBeLessThan(0);
  });

  it('za sort is reverse alphabetical', () => {
    const a = project({ name: 'Alpha' });
    const b = project({ name: 'Zeta' });
    expect(buildSorter('za')(a, b)).toBeGreaterThan(0);
  });

  it('featured sort uses az as tiebreaker within same featured group', () => {
    const a = project({ featured: true, name: 'Alpha' });
    const b = project({ featured: true, name: 'Zeta' });
    expect(buildSorter('featured')(a, b)).toBeLessThan(0);
  });
});

// ---------------------------------------------------------------------------
// applyFilters
// ---------------------------------------------------------------------------

describe('applyFilters', () => {
  const projects: ProjectData[] = [
    project({ slug: 'a', name: 'Alpha', tags: ['react'], featured: true, ongoing: true, repoUrl: 'https://github.com/a', relatedPosts: [] }),
    project({ slug: 'b', name: 'Beta', tags: ['vue'], featured: false, ongoing: false, liveUrl: 'https://beta.com', relatedSeries: { slug: 'series-1', name: 'Series 1' }, relatedPosts: [] }),
    project({ slug: 'c', name: 'Gamma', tags: [], featured: false, ongoing: false, relatedPosts: [{ slug: 'post-1', title: 'Post 1' }] }),
  ];

  const noFilters: import('./projectFilters').ProjectFilters = {
    tags: [], source: false, live: false, featured: false, ongoing: false, blog: false, sort: 'az',
  };

  it('returns all projects when no filters are active', () => {
    expect(applyFilters(projects, noFilters)).toHaveLength(3);
  });

  it('filters by tag', () => {
    const result = applyFilters(projects, { ...noFilters, tags: ['react'] });
    expect(result.map(p => p.slug)).toEqual(['a']);
  });

  it('filters by source availability', () => {
    const result = applyFilters(projects, { ...noFilters, source: true });
    expect(result.map(p => p.slug)).toEqual(['a']);
  });

  it('filters by live url', () => {
    const result = applyFilters(projects, { ...noFilters, live: true });
    expect(result.map(p => p.slug)).toEqual(['b']);
  });

  it('filters by featured', () => {
    const result = applyFilters(projects, { ...noFilters, featured: true });
    expect(result.map(p => p.slug)).toEqual(['a']);
  });

  it('filters by ongoing', () => {
    const result = applyFilters(projects, { ...noFilters, ongoing: true });
    expect(result.map(p => p.slug)).toEqual(['a']);
  });

  it('filters by blog content (series or related posts)', () => {
    const result = applyFilters(projects, { ...noFilters, blog: true });
    expect(result.map(p => p.slug)).toContain('b');
    expect(result.map(p => p.slug)).toContain('c');
    expect(result.map(p => p.slug)).not.toContain('a');
  });

  it('returns empty when no projects match', () => {
    const result = applyFilters(projects, { ...noFilters, tags: ['nonexistent'] });
    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// parseFiltersFromSearch
// ---------------------------------------------------------------------------

describe('parseFiltersFromSearch', () => {
  it('returns default filters for an empty string', () => {
    const f = parseFiltersFromSearch('');
    expect(f.tags).toEqual([]);
    expect(f.source).toBe(false);
    expect(f.live).toBe(false);
    expect(f.featured).toBe(false);
    expect(f.ongoing).toBe(false);
    expect(f.blog).toBe(false);
    expect(f.sort).toBe('featured');
  });

  it('parses multiple tags', () => {
    const f = parseFiltersFromSearch('tag=react&tag=typescript');
    expect(f.tags).toEqual(['react', 'typescript']);
  });

  it('parses boolean filters', () => {
    const f = parseFiltersFromSearch('source=true&live=true&featured=true&ongoing=true&blog=true');
    expect(f.source).toBe(true);
    expect(f.live).toBe(true);
    expect(f.featured).toBe(true);
    expect(f.ongoing).toBe(true);
    expect(f.blog).toBe(true);
  });

  it('parses sort', () => {
    expect(parseFiltersFromSearch('sort=newest').sort).toBe('newest');
    expect(parseFiltersFromSearch('sort=az').sort).toBe('az');
  });
});

// ---------------------------------------------------------------------------
// filtersToSearch
// ---------------------------------------------------------------------------

describe('filtersToSearch', () => {
  const defaults: import('./projectFilters').ProjectFilters = {
    tags: [], source: false, live: false, featured: false, ongoing: false, blog: false, sort: 'featured',
  };

  it('returns empty string for all-default filters', () => {
    expect(filtersToSearch(defaults)).toBe('');
  });

  it('encodes tags', () => {
    const s = filtersToSearch({ ...defaults, tags: ['react', 'typescript'] });
    expect(s).toContain('tag=react');
    expect(s).toContain('tag=typescript');
  });

  it('encodes boolean filters', () => {
    const s = filtersToSearch({ ...defaults, source: true, live: true });
    expect(s).toContain('source=true');
    expect(s).toContain('live=true');
  });

  it('omits sort=featured from the string (it is the default)', () => {
    const s = filtersToSearch({ ...defaults, sort: 'featured' });
    expect(s).not.toContain('sort');
  });

  it('encodes non-default sort', () => {
    const s = filtersToSearch({ ...defaults, sort: 'newest' });
    expect(s).toContain('sort=newest');
  });

  it('round-trips with parseFiltersFromSearch', () => {
    const original: import('./projectFilters').ProjectFilters = {
      tags: ['go', 'react'],
      source: true,
      live: false,
      featured: true,
      ongoing: false,
      blog: true,
      sort: 'oldest',
    };
    expect(parseFiltersFromSearch(filtersToSearch(original))).toEqual(original);
  });
});
