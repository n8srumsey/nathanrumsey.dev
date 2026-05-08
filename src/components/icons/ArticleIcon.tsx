export default function ArticleIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" className="inline-block align-middle shrink-0">
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M7 9h5" />
      <path d="M9.5 9v4.5" />
      <line x1="14" y1="9" x2="18" y2="9" />
      <line x1="14" y1="12" x2="18" y2="12" />
      <line x1="14" y1="15.5" x2="17" y2="15.5" />
    </svg>
  );
}
