type Props = {
  tag: string;
  onClick: () => void;
  isActive: boolean;
};

export function TagButton({ tag, onClick, isActive }: Props) {
  return (
    <button
      onClick={onClick}
      className={`font-mono text-xs px-2 py-0.5 rounded-full border transition-colors cursor-pointer shadow-sm pointer-events-auto ${
        isActive
          ? 'bg-primary-subtle border-primary text-primary'
          : 'bg-surface border-transparent text-muted-foreground hover:bg-primary-subtle hover:border-primary hover:text-primary'
      }`}
    >
      {tag}
    </button>
  );
}
