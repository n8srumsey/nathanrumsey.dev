const primaryChip = 'flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded-full border bg-primary-subtle border-primary text-primary';
const neutralChip = 'flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded-full border bg-surface border-border text-foreground';

export type FilterChip = {
  key: string;
  label: string;
  ariaLabel: string;
  onRemove: () => void;
  variant?: 'primary' | 'neutral';
};

export function FilterChipRow({ chips }: { chips: FilterChip[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 mb-4 min-h-6">
      {chips.map(chip => (
        <span key={chip.key} className={chip.variant === 'neutral' ? neutralChip : primaryChip}>
          {chip.label}
          <button
            onClick={chip.onRemove}
            aria-label={chip.ariaLabel}
            className={`cursor-pointer leading-none ${chip.variant === 'neutral' ? 'hover:text-primary' : 'hover:opacity-70'}`}
          >
            {'\u00D7'}
          </button>
        </span>
      ))}
    </div>
  );
}
