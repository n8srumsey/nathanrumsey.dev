import { useState, useRef } from 'react';
import { useClickOutside } from '../../utils/useClickOutside';
import { useIndexFilter } from '../../utils/useIndexFilter';
import {
  applyFilters,
  parseFiltersFromSearch,
  filtersToSearch,
  type ProjectSort,
} from '../../utils/projectFilters';
import ProjectCard from './ProjectCard';
import { TagAutocomplete } from '../ui/TagAutocomplete';
import { DropdownSelect } from '../ui/DropdownSelect';
import ChevronDownIcon from '../icons/ChevronDownIcon';
import { FilterEmptyState } from '../ui/FilterEmptyState';
import { FilterChipRow, type FilterChip } from '../ui/FilterChipRow';

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

const sortOptions = [
  { value: 'featured', label: 'Featured first' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'az', label: 'A \u2192 Z' },
  { value: 'za', label: 'Z \u2192 A' },
] as const;

export default function ProjectIndexFilter({ projects }: { projects: ProjectData[] }) {
  const { filters, set, clearFilters, allTags, results, addTag, removeTag } = useIndexFilter({
    parse: parseFiltersFromSearch,
    toSearch: filtersToSearch,
    clearPatch: { tags: [], source: false, live: false, featured: false, ongoing: false, blog: false },
    items: projects,
    applyFilters,
  });

  const [tagsOpen, setTagsOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const tagsRef = useRef<HTMLDivElement>(null);
  const mobileFiltersRef = useRef<HTMLDivElement>(null);

  useClickOutside(tagsRef, () => setTagsOpen(false));
  useClickOutside(mobileFiltersRef, () => setMobileFiltersOpen(false));

  const activeBinaryCount = [filters.source, filters.live, filters.featured, filters.ongoing, filters.blog].filter(Boolean).length;
  const totalMobileFilterCount = activeBinaryCount + filters.tags.length;

  const chips: FilterChip[] = filters.tags.map(tag => ({
    key: tag,
    label: tag,
    ariaLabel: `Remove tag: ${tag}`,
    onRemove: () => removeTag(tag),
  }));

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

      <FilterChipRow chips={chips} />

      {results.length === 0 ? (
        <FilterEmptyState message="No projects match the current filters." onClear={clearFilters} />
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
