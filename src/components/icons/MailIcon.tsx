import { EnvelopeIcon } from '@heroicons/react/24/outline';

export default function MailIcon({ size = 12 }: { size?: number }) {
  return (
    <EnvelopeIcon width={size} height={size} aria-hidden="true" className="shrink-0" />
  );
}
