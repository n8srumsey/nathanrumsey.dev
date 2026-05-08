import type { ComponentType } from 'react';

export default function IconLink({
  href,
  Icon,
  iconSize = 12,
  label,
  external = false,
}: {
  href: string;
  Icon: ComponentType<{ size?: number }>;
  iconSize?: number;
  label: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="flex items-center gap-1 underline underline-offset-4 hover:text-primary transition-colors pointer-events-auto"
    >
      <Icon size={iconSize} />
      {label}
    </a>
  );
}
