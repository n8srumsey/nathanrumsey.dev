# Content Authoring Guide

How to add and update content without touching UI code. Everything here works by editing files in `src/content/` and running `npm run build`.

---

## Blog Posts

### Creating a post

**Simple post (no images)**:
```
src/content/blog/my-post-slug.mdx
```

**Post with co-located images**:
```
src/content/blog/my-post-slug/
  index.mdx
  hero.jpg
  diagram.png
```

Both produce the same URL: `/blog/my-post-slug`.

### Frontmatter

```yaml
---
title: "Post Title"
date: 2026-05-01
description: "One sentence that appears in listings and as the SEO meta description."
tags: [astro, typescript, systems]
heroImage: ./hero.jpg      # optional; relative path to co-located image
series: my-series-slug     # optional; must match a filename in src/content/series/
draft: false               # default false; true = excluded from all builds
---
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | Yes | |
| `date` | date | Yes | `YYYY-MM-DD` format |
| `description` | string | Yes | Used in listings, RSS, and meta tags |
| `tags` | string[] | No | Defaults to `[]` |
| `heroImage` | string | No | Relative path; co-locate with the mdx file |
| `series` | string | No | Slug = filename without `.yaml` from `src/content/series/` |
| `draft` | boolean | No | Default `false` |

### Writing the post

After the frontmatter, write standard markdown. Code blocks get syntax highlighting automatically (Shiki, built into Astro — no config needed):

````markdown
```typescript
const x = 1;
```
````

### Adding images inline

Import at the top of the MDX file (after frontmatter):

```mdx
import { Image } from 'astro:assets';
import diagram from './diagram.png';

<Image src={diagram} alt="Architecture diagram showing X and Y" />
```

Standard markdown image syntax also works: `![alt text](./image.png)`.

### Setting a draft post live

Change `draft: false` (or remove the field entirely). Rebuild.

---

## Blog Series

### Creating a series

1. Create a YAML file in `src/content/series/`:

```yaml
# src/content/series/my-series.yaml
name: "Series Display Name"
description: "What this series covers. Shown on the series page."
posts:
  - first-post-slug
  - second-post-slug
```

The filename (without `.yaml`) is the series slug used in URLs and post frontmatter.

2. On each post that belongs to the series, add `series: my-series` to the frontmatter.

### Adding a post to an existing series

1. Add `series: my-series` to the post's frontmatter (if not already set).
2. Add the post's slug to the `posts[]` array in the series YAML at the position you want it.

The `posts` array drives display order on the series page and determines prev/next navigation within posts. The array is the source of truth — not post publication date.

### Series page URL

`/blog/series/[series-slug]`

---

## Projects

### Minimal project (catalog entry only)

Create an MDX file with frontmatter and no body:

```mdx
---
name: project-name
description: "What this project is. One to two sentences."
tags: [Go, systems]
repoUrl: https://github.com/you/project-name
---
```

In the catalog, this links directly to `liveUrl` (if set) or `repoUrl`. No dedicated project page is generated.

### Detailed project (with its own page)

Add body content to the MDX file:

```mdx
---
name: project-name
description: "What this project is."
tags: [Astro, TypeScript]
repoUrl: https://github.com/you/project-name
liveUrl: https://project.example.com
featured: true
relatedSeries: my-series-slug       # optional
relatedPosts: [post-slug-1]         # optional, list of blog post slugs
---

## Overview

Your README-style content here. Full MDX is supported — headings, code blocks, images, React components.

## Technical details

...
```

With images, use the directory structure:
```
src/content/projects/project-name/
  index.mdx
  hero.jpg
```

The project gets a page at `/projects/project-name`. The catalog links to the detail page instead of directly to external links.

### Frontmatter reference

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | Yes | Display name; shown in catalog and detail page header |
| `description` | string | Yes | Short summary for catalog cards and meta tags |
| `tags` | string[] | No | Defaults to `[]` |
| `repoUrl` | URL | No | GitHub or other source link |
| `liveUrl` | URL | No | Live demo or deployed site |
| `featured` | boolean | No | Default `false`; featured projects sort to top of catalog |
| `relatedSeries` | string | No | Series slug; shown on detail page |
| `relatedPosts` | string[] | No | Blog post slugs; shown as links on detail page |
| `annotations` | array | No | See Annotations section |

---

## Resume

Edit `src/content/resume/main.yaml`. The schema validates on build, so malformed YAML or missing required fields will fail with a clear error.

### Full schema

```yaml
basics:
  name: "Your Name"
  title: "Your Professional Title"
  email: "you@example.com"
  website: "https://yoursite.com"
  location: "City, State"
  summary: "Optional brief bio shown at the top of the resume."

experience:
  - company: "Company Name"
    role: "Your Role"
    start: "YYYY-MM"        # e.g. "2024-01"
    end: "YYYY-MM"          # omit entirely for current position (displays "Present")
    location: "City or Remote"
    description: "What you did. This is plain text in MVP."
    highlights:
      - "Specific achievement or responsibility"
      - "Another bullet point"
    annotations:            # optional; not rendered in MVP
      - term: "exact phrase from description"
        detail: "Tooltip or context text"
        style: keyword      # keyword | tech | achievement

education:
  - institution: "University Name"
    degree: "B.S."
    field: "Computer Science"   # optional
    start: "YYYY-MM"
    end: "YYYY-MM"              # omit for in-progress
    description: "Optional additional context."

skills:
  categories:
    - name: "Languages"
      items: [TypeScript, Go, Python, Rust]
    - name: "Frontend"
      items: [React, Astro, Tailwind CSS]
    - name: "Infrastructure"
      items: [PostgreSQL, Docker, Kubernetes]
```

### Adding a new job

Append a new object to `experience[]`:

```yaml
  - company: "New Company"
    role: "New Role"
    start: "2026-01"
    description: "..."
    highlights: []
```

### Showing a current position

Omit the `end` field. The resume page renders it as "Present".

### Reordering sections

Change the order of items within `experience[]`, `education[]`, or `skills.categories[]`.

---

## Annotations (future feature, MVP state)

Annotations allow specific terms in resume descriptions or project descriptions to render with special styling or tooltip context. The data model is live; the UI is not yet implemented.

### What they are

```yaml
description: "Led development of the data ingestion pipeline."
annotations:
  - term: "data ingestion pipeline"
    detail: "Built with Go + Kafka, processing 50M events/day"
    style: tech
```

When implemented, the term `"data ingestion pipeline"` in the rendered description will have visual treatment (highlighting, underline, etc.) and show `detail` on hover or click.

### Annotation fields

| Field | Required | Values | Notes |
|---|---|---|---|
| `term` | Yes | string | Must match a substring in `description` exactly |
| `detail` | Yes | string | Tooltip/popover content |
| `style` | No | `keyword`, `tech`, `achievement` | Visual treatment category |

### Current behavior

Annotations are stored and validated by the schema, but the UI ignores them. Resume descriptions render as plain text.

### When to add annotations

You can add annotations now — they'll be ready when the UI is implemented. They're most useful for:
- Technical terms that need context (`tech`)
- Specific tools, languages, or systems mentioned in passing
- Quantified achievements (`achievement`)
- Any phrase where a reader would benefit from one sentence of context

---

## Rebuilding and Previewing

After any content change:

```bash
npm run build    # full build (validates all schemas, generates all pages)
npm run preview  # serve the built output at localhost:4321
```

For development with hot reload:

```bash
npm run dev      # watch mode; schema errors appear in the terminal
```

Type and schema errors from `src/content/config.ts` surface on first access of the affected collection during `dev` or at build time.
