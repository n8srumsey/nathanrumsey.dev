import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const AnnotationSchema = z.object({
  term: z.string(),
  detail: z.string(),
  style: z.enum(['keyword', 'tech', 'achievement']).optional(),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    heroImage: z.string().optional(),
    imageCaption: z.string().optional(),
    series: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const series = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/series' }),
  schema: z.object({
    name: z.string(),
    description: z.string().optional(),
    heroImage: z.string().optional(),
    posts: z.array(z.string()),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    repoUrl: z.string().url().optional(),
    liveUrl: z.string().url().optional(),
    featured: z.boolean().default(false),
    start: z.string().optional(),
    end: z.string().optional(),
    resumeSummary: z.string().optional(),
    resumeHighlights: z.array(z.string()).optional(),
    relatedSeries: z.string().optional(),
    relatedPosts: z.array(z.string()).default([]),
    image: z.string().optional(),
    imageCaption: z.string().optional(),
    homepagePin: z.boolean().optional(),
    annotations: z.array(AnnotationSchema).optional(),
  }),
});

const resume = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/resume' }),
  schema: z.object({
    basics: z.object({
      name: z.string(),
      title: z.string(),
      email: z.string().email().optional(),
      website: z.string().url().optional(),
      location: z.string().optional(),
      summary: z.string().optional(),
      social: z.object({
        github: z.string().url(),
        linkedin: z.string().url(),
      }).optional(),
    }),
    experience: z.array(z.object({
      company: z.string(),
      role: z.string(),
      start: z.string(),
      end: z.string().optional(),
      location: z.string().optional(),
      description: z.string(),
      highlights: z.array(z.string()).default([]),
      annotations: z.array(AnnotationSchema).optional(),
    })),
    education: z.array(z.object({
      institution: z.string(),
      location: z.string(),
      degree: z.string(),
      start: z.string(),
      end: z.string().optional(),
      gpa: z.string().optional(),
      activities: z.string().optional(),
      awards: z.string().optional(),
      annotations: z.array(AnnotationSchema).optional(),
    })),
    skills: z.object({
      categories: z.array(z.object({
        name: z.string(),
        items: z.array(z.string()),
      })),
    }),
  }),
});

export const collections = { blog, series, projects, resume };
