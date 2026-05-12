type ProjectData = {
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