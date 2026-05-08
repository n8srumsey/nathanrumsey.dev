import { siGithub } from 'simple-icons';

export default function GitHubIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"
      aria-hidden="true" className="shrink-0">
      <path d={siGithub.path} />
    </svg>
  );
}
