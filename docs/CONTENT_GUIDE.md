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
imageCaption: "Caption text shown below the hero image."  # optional
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
| `imageCaption` | string | No | Caption rendered below the hero image |
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
heroImage: ./hero.jpg   # optional
posts:
  - first-post-slug
  - second-post-slug
```

The filename (without `.yaml`) is the series slug used in URLs and post frontmatter.

2. On each post that belongs to the series, add `series: my-series` to the frontmatter.

### Frontmatter reference

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | Yes | Display name for the series page |
| `description` | string | No | Shown on the series page |
| `heroImage` | string | No | Relative path to a co-located image |
| `posts` | string[] | Yes | Ordered list of post slugs (drives display order and prev/next nav) |

### Adding a post to an existing series

1. Add `series: my-series` to the post's frontmatter (if not already set).
2. Add the post's slug to the `posts[]` array in the series YAML at the position you want it.

The `posts` array is the source of truth for order — not publication date.

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
start: "2026-01"
end: "2026-05"             # omit for ongoing
relatedSeries: my-series-slug
relatedPosts: [post-slug-1]
---

## Overview

Your README-style content here. Full MDX is supported — headings, code blocks, images, React components.
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
| `start` | string | No | Start date `YYYY-MM` format; shown on detail page |
| `end` | string | No | End date `YYYY-MM` format; omit for ongoing |
| `image` | string | No | Relative path to a co-located image for the catalog card |
| `imageCaption` | string | No | Caption shown below the image on the detail page |
| `homepagePin` | boolean | No | Pins the project to the landing page featured section |
| `resumeSummary` | string | No | One-line summary used if the project is cross-referenced on the resume |
| `resumeHighlights` | string[] | No | Bullet points used if the project is cross-referenced on the resume |
| `relatedSeries` | string | No | Series slug; shown as a link on the detail page |
| `relatedPosts` | string[] | No | Blog post slugs; shown as links on the detail page |
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
  social:
    github: "https://github.com/you"
    linkedin: "https://linkedin.com/in/you"

experience:
  - company: "Company Name"
    role: "Your Role"
    start: "YYYY-MM"        # e.g. "2024-01"
    end: "YYYY-MM"          # omit entirely for current position (displays "Present")
    location: "City or Remote"
    description: "What you did. Plain text."
    highlights:
      - "Specific achievement or responsibility"
      - "Another bullet point"
    annotations:            # optional; not rendered yet — see Annotations section
      - term: "exact phrase from description"
        detail: "Tooltip or context text"
        style: keyword      # keyword | tech | achievement

education:
  - institution: "University Name"
    location: "City, State"
    degree: "B.S. in Computer Science"   # optional
    start: "YYYY-MM"
    end: "YYYY-MM"              # omit for in-progress
    gpa: "Optional additional context."
    activities: "Optional additional context."
    awards: "Optional additional context


skills:
  categories:
    - name: "Languages"
      items: [TypeScript, Go, Python, Rust]
    - name: "Frontend"
      items: [React, Astro, Tailwind CSS]
    - name: "Infrastructure"
      items: [PostgreSQL, Docker, Kubernetes]
```

### Basics fields

| Field | Required | Notes |
|---|---|---|
| `name` | Yes | |
| `title` | Yes | Shown as subtitle under your name |
| `email` | No | |
| `website` | No | |
| `location` | No | |
| `summary` | No | Short bio at the top of the resume |
| `social.github` | No | Full URL |
| `social.linkedin` | No | Full URL |

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

## Annotations

Annotations mark specific terms in resume experience descriptions so that hovering (or tapping on mobile) reveals a tooltip with additional context. Annotated terms render with a dotted underline as a visual signal.

### What they look like in YAML

```yaml
description: "Led development of the data ingestion pipeline."
annotations:
  - term: "data ingestion pipeline"
    detail: "Built with Go + Kafka, processing 50M events/day at peak load"
    style: tech
```

The term `"data ingestion pipeline"` gets a dotted underline in the rendered description. Hovering reveals the `detail` text in a tooltip.

### Annotation fields

| Field | Required | Values | Notes |
|---|---|---|---|
| `term` | Yes | string | Must match a substring in `description` exactly (case-sensitive) |
| `detail` | Yes | string | Tooltip content — one to two sentences |
| `style` | No | `keyword`, `tech`, `achievement` | Semantic label shown in the tooltip header |

### When to annotate

**Should annotate:** a metric or quantified achievement in a bullet that would read as a large claim without context. Use `detail` to explain how the number was derived or what the baseline was.

**May annotate:** a technical term used in passing where a non-specialist reader would benefit from one sentence of context — the specific system, tool, or concept behind the name.

**Should not annotate:** every technical term by default. Annotations are for context that adds genuine signal, not decoration. If the term is self-evident to the target audience, skip it.

**Must not annotate:** a term that doesn't appear verbatim in the `description` string. The match is exact substring — a typo or paraphrase silently produces no annotation.

### Style values

`style` is semantic metadata — the dotted underline is visually identical across all three. The value appears as a muted label in the tooltip header to help readers orient.

| Value | Use for |
|---|---|
| `keyword` | Domain terms, industry jargon, named programs or policies |
| `tech` | Programming languages, frameworks, tools, systems |
| `achievement` | Metrics, outcomes, quantified impact |

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

Schema errors from `src/content.config.ts` surface on first access of the affected collection during `dev` or at build time.
