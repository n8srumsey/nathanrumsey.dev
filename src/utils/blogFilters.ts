export type BlogSort = 'newest' | 'oldest' | 'az' | 'za';
export type LengthBucket = '' | 'short' | 'medium' | 'long';

export type BlogFilters = {
  tags: string[];
  year: string;
  length: LengthBucket;
  sort: BlogSort;
};

export function parseFiltersFromSearch(search: string): BlogFilters {
  const p = new URLSearchParams(search);
  return {
    tags: p.getAll('tag'),
    year: p.get('year') ?? '',
    length: (p.get('length') as LengthBucket) ?? '',
    sort: (p.get('sort') as BlogSort) ?? 'newest',
  };
}

export function filtersToSearch(f: BlogFilters): string {
  const p = new URLSearchParams();
  f.tags.forEach(t => p.append('tag', t));
  if (f.year) p.set('year', f.year);
  if (f.length) p.set('length', f.length);
  if (f.sort !== 'newest') p.set('sort', f.sort);
  return p.toString();
}
