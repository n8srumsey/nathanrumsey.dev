import { useState, useRef } from 'react';
import { useClickOutside } from '../../utils/useClickOutside';
import ChevronDownIcon from '../icons/ChevronDownIcon';

export interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  sortSelectedToTop?: boolean;
}

export function DropdownSelect({ options, value, onChange, ariaLabel, sortSelectedToTop = false }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find(o => o.value === value)?.label ?? value;
  const displayOptions = sortSelectedToTop
    ? [...options.filter(o => o.value === value), ...options.filter(o => o.value !== value)]
    : options;

  useClickOutside(ref, () => setOpen(false));

  const select = (val: string) => {
    onChange(val);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const idx = displayOptions.findIndex(o => o.value === value);
    if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(o => !o);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (idx < displayOptions.length - 1) select(displayOptions[idx + 1].value);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (idx > 0) select(displayOptions[idx - 1].value);
    }
  };

  return (
    <div
      ref={ref}
      className="relative"
      onBlur={e => { if (!ref.current?.contains(e.relatedTarget as Node)) setOpen(false); }}
    >
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen(o => !o)}
        onKeyDown={onKeyDown}
        className="font-mono text-xs border border-border rounded px-2 py-1 bg-surface text-foreground flex items-center gap-1.5 hover:border-primary/40 transition-colors cursor-pointer"
      >
        {selectedLabel}
        <ChevronDownIcon className={open ? 'rotate-180' : ''} />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 top-full mt-0.5 min-w-full z-20 bg-surface border border-border rounded shadow-md"
        >
          {displayOptions.map(opt => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              onMouseDown={e => { e.preventDefault(); select(opt.value); }}
              className={`font-mono text-xs px-2 py-1.5 cursor-pointer whitespace-nowrap ${
                opt.value === value
                  ? 'bg-primary-subtle text-primary'
                  : 'text-foreground hover:bg-primary-subtle hover:text-primary'
              }`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
