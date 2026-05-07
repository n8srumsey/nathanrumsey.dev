import { describe, it, expect } from 'vitest';
import { idToSlug } from './slugs';

describe('idToSlug', () => {
  it('strips .mdx extension', () => {
    expect(idToSlug('hello-world.mdx')).toBe('hello-world');
  });

  it('strips .md extension', () => {
    expect(idToSlug('hello-world.md')).toBe('hello-world');
  });

  it('strips /index.mdx from nested content files', () => {
    expect(idToSlug('hello-world/index.mdx')).toBe('hello-world');
  });

  it('strips /index.md from nested content files', () => {
    expect(idToSlug('hello-world/index.md')).toBe('hello-world');
  });

  it('strips .yaml extension for data collection entries', () => {
    expect(idToSlug('building-nathanrumsey-dev.yaml')).toBe('building-nathanrumsey-dev');
  });

  it('strips .yml extension for data collection entries', () => {
    expect(idToSlug('my-series.yml')).toBe('my-series');
  });
});
