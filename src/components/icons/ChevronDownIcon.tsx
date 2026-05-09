export default function ChevronDownIcon({ size = 12, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" className={`shrink-0${className ? ` ${className}` : ''}`}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
