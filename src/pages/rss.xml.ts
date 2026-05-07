import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { idToSlug } from '../utils/slugs';

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    title: 'Nathan Rumsey',
    description: 'Dev diaries and essays on technology.',
    site: context.site!,
    items: posts.map(post => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/blog/${idToSlug(post.id)}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}
