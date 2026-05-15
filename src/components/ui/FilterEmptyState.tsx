export function FilterEmptyState({ message, onClear }: { message: string; onClear: () => void }) {
  return (
    <div className="py-16 text-center text-muted-foreground space-y-3">
      <p>{message}</p>
      <button
        onClick={onClear}
        className="font-mono text-xs underline hover:text-primary transition-colors cursor-pointer"
      >
        Clear all filters
      </button>
    </div>
  );
}
