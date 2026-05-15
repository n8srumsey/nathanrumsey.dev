import { describe, it, expect } from 'vitest';
import {
  parseFiltersFromSearch,
  filtersToSearch,
  type BlogFilters,
} from './blogFilters';

// ---------------------------------------------------------------------------
// parseFiltersFromSearch
// ---------------------------------------------------------------------------

describe('parseFiltersFromSearch', () => {
  it('returns default filters for an empty string', () => {
    const f = parseFiltersFromSearch('');
    expect(f.tags).toEqual([]);
    expect(f.year).toBe('');
    expect(f.length).toBe('');
    expect(f.sort).toBe('newest');
  });

  it('parses multiple tags', () => {
    const f = parseFiltersFromSearch('tag=react&tag=typescript');
    expect(f.tags).toEqual(['react', 'typescript']);
  });

  it('parses year filter', () => {
    expect(parseFiltersFromSearch('year=2024').year).toBe('2024');
  });

  it('parses each length value', () => {
    expect(parseFiltersFromSearch('length=short').length).toBe('short');
    expect(parseFiltersFromSearch('length=medium').length).toBe('medium');
    expect(parseFiltersFromSearch('length=long').length).toBe('long');
  });

  it('parses each sort value', () => {
    expect(parseFiltersFromSearch('sort=newest').sort).toBe('newest');
    expect(parseFiltersFromSearch('sort=oldest').sort).toBe('oldest');
    expect(parseFiltersFromSearch('sort=az').sort).toBe('az');
    expect(parseFiltersFromSearch('sort=za').sort).toBe('za');
  });

  it('defaults sort to newest when absent', () => {
    expect(parseFiltersFromSearch('year=2023').sort).toBe('newest');
  });

  it('parses combined filters', () => {
    const f = parseFiltersFromSearch('tag=go&tag=rust&year=2022&length=long&sort=az');
    expect(f.tags).toEqual(['go', 'rust']);
    expect(f.year).toBe('2022');
    expect(f.length).toBe('long');
    expect(f.sort).toBe('az');
  });
});

// ---------------------------------------------------------------------------
// filtersToSearch
// ---------------------------------------------------------------------------

describe('filtersToSearch', () => {
  const defaults: BlogFilters = {
    tags: [],
    year: '',
    length: '',
    sort: 'newest',
  };

  it('returns empty string for all-default filters', () => {
    expect(filtersToSearch(defaults)).toBe('');
  });

  it('encodes tags', () => {
    const s = filtersToSearch({ ...defaults, tags: ['react', 'typescript'] });
    expect(s).toContain('tag=react');
    expect(s).toContain('tag=typescript');
  });

  it('encodes year', () => {
    const s = filtersToSearch({ ...defaults, year: '2023' });
    expect(s).toContain('year=2023');
  });

  it('encodes length', () => {
    expect(filtersToSearch({ ...defaults, length: 'short' })).toContain('length=short');
    expect(filtersToSearch({ ...defaults, length: 'medium' })).toContain('length=medium');
    expect(filtersToSearch({ ...defaults, length: 'long' })).toContain('length=long');
  });

  it('omits sort=newest from the string (it is the default)', () => {
    expect(filtersToSearch({ ...defaults, sort: 'newest' })).not.toContain('sort');
  });

  it('encodes non-default sort values', () => {
    expect(filtersToSearch({ ...defaults, sort: 'oldest' })).toContain('sort=oldest');
    expect(filtersToSearch({ ...defaults, sort: 'az' })).toContain('sort=az');
    expect(filtersToSearch({ ...defaults, sort: 'za' })).toContain('sort=za');
  });

  it('omits empty year', () => {
    expect(filtersToSearch({ ...defaults, year: '' })).not.toContain('year');
  });

  it('omits empty length', () => {
    expect(filtersToSearch({ ...defaults, length: '' })).not.toContain('length');
  });

  it('round-trips with parseFiltersFromSearch', () => {
    const original: BlogFilters = {
      tags: ['go', 'react'],
      year: '2023',
      length: 'medium',
      sort: 'oldest',
    };
    expect(parseFiltersFromSearch(filtersToSearch(original))).toEqual(original);
  });

  it('round-trips with all defaults', () => {
    expect(parseFiltersFromSearch(filtersToSearch(defaults))).toEqual(defaults);
  });
});
