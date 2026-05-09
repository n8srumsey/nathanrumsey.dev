import GitHubIcon from '../icons/GitHubIcon';
import GlobeIcon from '../icons/GlobeIcon';
import ChevronRightIcon from '../icons/ChevronRightIcon';
import LayersIcon from '../icons/LayersIcon';
import ArticleIcon from '../icons/ArticleIcon';
import IconLink from '../ui/IconLink';
import TagList from '../ui/TagList';

export type ProjectData = {
  slug: string;
  name: string;
  description: string;
  tags: string[];
  featured: boolean;
  repoUrl?: string;
  liveUrl?: string;
  hasDetailPage: boolean;
  relatedSeries?: { slug: string; name: string };
  relatedPosts: { slug: string; title: string }[];
  image?: string;
  start?: string;
  end?: string;
};

interface Props {
  project: ProjectData;
  onTagClick: (tag: string) => void;
  activeTags: string[];
}

export default function ProjectCard({ project, onTagClick, activeTags }: Props) {
  const href = project.hasDetailPage
    ? `/projects/${project.slug}`
    : (project.liveUrl ?? project.repoUrl ?? '#');
  const isExternal = !project.hasDetailPage && href !== '#';

  const overlayLink = project.hasDetailPage ? (
    <a
      href={`/projects/${project.slug}`}
      className="absolute inset-0 rounded-lg"
      aria-hidden="true"
      tabIndex={-1}
    />
  ) : null;

  const innerContent = (
    <div className="relative flex items-start justify-between gap-4 pointer-events-none pb-5">
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold font-mono">
          {href !== '#' ? (
            <a
              href={href}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              className="hover:underline pointer-events-auto"
            >
              {project.name}
            </a>
          ) : project.name}
        </h2>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{project.description}</p>
        {project.tags.length > 0 && (
          <TagList tags={project.tags} activeTags={activeTags} onTagClick={onTagClick} />
        )}
        {(project.repoUrl || project.liveUrl || project.relatedSeries || project.relatedPosts.length > 0) && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 font-mono text-xs text-muted-foreground">
            {project.repoUrl && (
              <IconLink href={project.repoUrl} Icon={GitHubIcon} label="Source" external />
            )}
            {project.liveUrl && (
              <IconLink href={project.liveUrl} Icon={GlobeIcon} label="Live" external />
            )}
            {project.relatedSeries && (
              <IconLink href={`/blog/series/${project.relatedSeries.slug}`} Icon={LayersIcon} label="Blog Series" />
            )}
            {project.relatedPosts.map(post => (
              <IconLink key={post.slug} href={`/blog/${post.slug}`} Icon={ArticleIcon} label="Blog Post" />
            ))}
          </div>
        )}
      </div>
      {project.featured && (
        <span className="font-mono text-xs text-primary shrink-0">featured</span>
      )}
    </div>
  );

  const readMoreLink = project.hasDetailPage ? (
    <a
      href={`/projects/${project.slug}`}
      className="absolute bottom-3.5 right-4 flex items-center gap-0.5 font-mono text-xs text-muted-foreground group-hover:text-primary group-hover:font-medium transition-colors"
      aria-hidden="true"
      tabIndex={-1}
    >
      Read more
      <ChevronRightIcon />
    </a>
  ) : null;

  if (project.image) {
    return (
      <article className="border border-border rounded-lg hover:border-primary/40 bg-surface-raised shadow-md transition-colors relative group flex overflow-hidden">
        {overlayLink}
        <div className="flex-1 min-w-0 p-5 relative">
          {innerContent}
          {readMoreLink}
        </div>
        <div className="w-44 shrink-0 self-stretch">
          <img src={project.image} alt="" className="w-full h-full object-cover" aria-hidden="true" />
        </div>
      </article>
    );
  }

  return (
    <article className="border border-border rounded-lg p-5 hover:border-primary/40 bg-surface-raised shadow-md transition-colors relative group">
      {overlayLink}
      <div className="relative flex items-start justify-between gap-4 pointer-events-none">
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold font-mono">
            {href !== '#' ? (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="hover:underline pointer-events-auto"
              >
                {project.name}
              </a>
            ) : project.name}
          </h2>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{project.description}</p>
          {project.tags.length > 0 && (
            <TagList tags={project.tags} activeTags={activeTags} onTagClick={onTagClick} />
          )}
          {(project.repoUrl || project.liveUrl || project.relatedSeries || project.relatedPosts.length > 0) && (
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 font-mono text-xs text-muted-foreground">
              {project.repoUrl && (
                <IconLink href={project.repoUrl} Icon={GitHubIcon} label="Source" external />
              )}
              {project.liveUrl && (
                <IconLink href={project.liveUrl} Icon={GlobeIcon} label="Live" external />
              )}
              {project.relatedSeries && (
                <IconLink href={`/blog/series/${project.relatedSeries.slug}`} Icon={LayersIcon} label="Blog Series" />
              )}
              {project.relatedPosts.map(post => (
                <IconLink key={post.slug} href={`/blog/${post.slug}`} Icon={ArticleIcon} label="Blog Post" />
              ))}
            </div>
          )}
        </div>
        {project.featured && (
          <span className="font-mono text-xs text-primary shrink-0">featured</span>
        )}
      </div>
      {readMoreLink}
    </article>
  );
}
