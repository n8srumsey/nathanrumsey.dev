# Architecture

Design decisions, pattern catalog, and rationale for nathanrumsey.dev. Written May 2026.

This document names the design patterns in use, explains how they manifest in this codebase, and records why each was chosen. New structural additions should identify their pattern here.

## What This Site Is

A personal portfolio site with four sections:

1. **Landing** — minimal introduction
2. **Resume** — digital resume driven by a YAML file; UI is a template over data
3. **Blog** — dev diaries and essays; markdown-first, supports series grouping
4. **Projects** — catalog of work; projects optionally get detail pages

Two non-negotiables shaped all decisions:

- **Static output**: no server, CDN-served, deployable for free
- **File-based content**: update resume or add a blog post by editing a text file, not UI code

---

## Framework: Why Astro

Three options were evaluated:

| | Astro | Next.js (static export) | Gatsby |
|---|---|---|---|
| Static output | Primary mode | Secondary mode | Primary mode |
| Content management | Content Collections (built-in) | `getStaticProps` + file reads | GraphQL data layer |
| MDX | Built-in | `next-mdx-remote` / `@next/mdx` | `gatsby-plugin-mdx` |
| React | Islands (opt-in) | Always | Always |
| Build speed | Fast | Fast | Slow |
| Ecosystem trend | Growing | Dominant | Stagnating |

**Astro** was chosen because:

- Static output is the _primary_ design goal, not a mode you opt into
- Content Collections give us typed, schema-validated file-based content management without any additional tooling
- Islands architecture means zero JS shipped by default; React is added only where interactivity is needed
- MDX support is first-class, not a plugin add-on

**Next.js static export** is a valid alternative and more React-native. The tradeoff: Next.js is architecturally designed for server-rendering; static export works but some features degrade. Ruled out because working against the grain of the framework adds cognitive overhead.

**Gatsby** was the prior stack. Ruled out: slower builds, stagnating ecosystem relative to Astro and Next.js, GraphQL data layer adds complexity for a simple content model.

---

## Tailwind CSS v4

Astro 5's `astro add tailwind` installs Tailwind **v4** via the `@tailwindcss/vite` Vite plugin, not the legacy `@astrojs/tailwind` integration which targets v3.

`@tailwindcss/typography` is included for the `prose` class used on MDX content (blog posts, project detail pages). It's an official Tailwind package maintained by the same team.

---

## Content Model

### Pattern: Repository + Schema-First Design

All content access goes through Astro's Content Layer API (`getCollection`, `getEntry` from `astro:content`). Pages never read `src/content/` files directly — they always go through the collection API. This is the **Repository Pattern**: a single abstraction layer between the data store (files) and the consumers (pages), which enforces the schema contract.

The schema in `src/content.config.ts` is defined using Zod. This is **Schema-First Design**: the data contract is declared before any UI is written; the UI trusts it. Build fails on schema violations — content errors are caught at build time, not at runtime. Adding a field means first declaring it in the schema.

**Astro 6 Content Layer**: collections use `loader: glob(...)` (not the legacy `type: 'content'` / `type: 'data'` API which was removed in Astro 6). Config lives at `src/content.config.ts`. Entries use `entry.id` (file path relative to loader base, with extension, e.g., `hello-world/index.mdx`). Converting to a URL slug: `idToSlug(entry.id)` from `src/utils/slugs.ts`. Rendering MDX: `import { render } from 'astro:content'`, then `const { Content } = await render(entry)`.

### Blog (`glob: **/*.{md,mdx}`)

- URL: `/blog/[slug]` via `idToSlug(entry.id)`
- Files: flat (`post.mdx`) or nested (`post-name/index.mdx`) for co-located images — both produce clean single-segment slugs
- Fields: `title`, `date`, `description`, `tags[]`, `heroImage?`, `series?`, `draft`
- `draft: true` excludes via collection filter; never reaches `getStaticPaths`

### Series (`glob: *.yaml`)

- URL: `/blog/series/[slug]` where slug = `idToSlug(entry.id)` (strips `.yaml`)
- Fields: `name`, `description?`, `posts[]` (ordered array of blog post slugs)
- The `posts` array is the **canonical ordering** — used for series page rendering and in-post prev/next navigation
- A blog post declares series membership via `series: 'series-slug'` in frontmatter; matched by `entry.id === series + '.yaml'` in page code

### Projects (`glob: **/*.{md,mdx}`)

- URL: `/projects/[slug]`
- MDX body serves as README-style detail content (see Progressive Disclosure pattern below)
- Fields: `name`, `description`, `tags[]`, `repoUrl?`, `liveUrl?`, `featured`, `relatedSeries?`, `relatedPosts[]`, `annotations?`

### Resume (`glob: *.yaml`)

- Single file: `src/content/resume/main.yaml`
- Access: `const entries = await getCollection('resume'); const resume = entries[0].data`
- Sections: `basics`, `experience[]`, `education[]`, `skills.categories[]`
- `src/pages/resume.astro` is a pure **template** over this data structure — no hardcoded content

---

## Annotation System

Resume experience entries, education entries, and project descriptions support an optional `annotations[]` array in their YAML:

```yaml
description: "Led development of the data ingestion pipeline."
annotations:
  - term: "data ingestion pipeline"
    detail: "Built with Go + Kafka, processing 50M events/day"
    style: keyword   # keyword | tech | achievement
```

**Rendering**: `AnnotatedText` (paragraph wrapper) and `AnnotatedSpan` (inline wrapper) are React islands in `src/components/ui/AnnotatedText.tsx`. They parse `description` against `annotations[]` via `parseAnnotatedText()` (`src/utils/annotations.ts`), splitting it into plain and annotated segments. Annotated terms render with a dotted underline; hovering (or clicking on touch devices) reveals a tooltip with the `detail` text and a muted `style` label.

**Wiring**: `ExperienceEntry.astro` and `ProjectEntry.astro` use `AnnotatedText` for `description` and per-highlight text. `EducationEntry.astro` uses `AnnotatedSpan` for `gpa` and `activities` (both optional fields rendered inline).

The annotation `term` is matched as a case-sensitive substring of `description`. A term that doesn't appear verbatim produces no annotation.

---

## Project Tiering

### Pattern: Progressive Disclosure

Projects implement **Progressive Disclosure**: the system exposes as much detail as has been authored, adapting behavior to data presence rather than requiring a configuration flag. The tier is determined by content, not by declaring "I am a detailed project."

**Catalog-only (minimal)**: MDX frontmatter only, no body => catalog card linking directly to `liveUrl`/`repoUrl`. No separate page generated.

**Detail page (full)**: MDX body content present, and/or `relatedSeries`/`relatedPosts` in frontmatter → catalog card + `/projects/[slug]` detail page. MDX body renders as prose via `<Content />`.

Detection (used in both catalog and `getStaticPaths`):

```typescript
const hasDetailPage =
  (project.body?.trim().length ?? 0) > 0 ||
  !!project.data.relatedSeries ||
  project.data.relatedPosts.length > 0;
```

This avoids a `type: 'minimal' | 'detailed'` enum, which would require manual reclassification. The content itself is the declaration. All projects appear in the catalog; `featured: true` floats a project to the top.

---

## Blog Series

### Pattern: Bidirectional Association with Single Source of Truth

A series is a YAML data collection entry listing blog post slugs in canonical order. This implements a **bidirectional association** with an explicit single source of truth:

```yaml
# src/content/series/my-series.yaml — source of truth for order
name: "Series Name"
description: "What this is about."
posts:
  - first-post    # ordered; this array drives all series rendering
  - second-post
  - third-post
```

- **Series YAML** (`posts[]` array): source of truth for membership and order — used for series page rendering and prev/next navigation
- **Post frontmatter** (`series: slug`): declaration of membership — used only to fetch the series entry from within the post page

These two are deliberately redundant. The post's `series` field says "I belong to X"; the series `posts` array says "X contains these, in this order." The series file is always authoritative for ordering; post publication date is not used for series order.

**In-post navigation**: the blog post page fetches its series entry, locates itself in `posts[]` by slug, then reads the adjacent slugs for prev/next links.

**Adding a post to a series**: set `series: slug` in the post frontmatter AND add the slug to the series YAML `posts[]` at the desired position. Both edits are required.

---

## Image Handling

For blog posts and projects with images, co-locate images with the content file:

```text
src/content/blog/my-post/
  index.mdx
  hero.jpg
  diagram.png
```

Astro's built-in image optimization handles co-located images referenced from MDX:

```mdx
import { Image } from 'astro:assets';
import hero from './hero.jpg';

<Image src={hero} alt="Description" />
```

Standard markdown image syntax also works for simple cases: `![alt](./image.png)`.

Images for the `public/` directory (favicon, OG images) are served as-is without optimization.

---

## Package Philosophy

Principle: add a package only if implementing it would meaningfully change the scope or focus of the codebase.

**Rolled (no package):**

- Reading time (`src/utils/readingTime.ts`): `Math.ceil(wordCount / 200)` — 3 lines

**Kept:**

- `@astrojs/rss`: RSS XML generation — fiddly to write correctly by hand; official Astro package
- `@astrojs/sitemap`: sitemap generation — same rationale
- `@tailwindcss/typography`: `prose` styling for MDX content — substantial CSS, officially maintained
- `@astrojs/react`, `react`, `react-dom`: interactive components
- `@astrojs/mdx`: MDX support

---

## Component Library

`src/components/ui/` contains hand-written Tailwind components — no external component library (shadcn, Radix, etc.).

Rationale:

- The site is simple enough that a library's surface area exceeds the actual need
- LLM-assisted development works well with Tailwind's constraint system; generated components are consistent
- Full control over styling without fighting library opinions or upgrade cycles

As the UI matures, components should emerge from actual usage patterns, not be pre-built speculatively.

---

## Deployment Pipeline

```text
git push main
  → GitHub Actions (.github/workflows/deploy.yml)
    → actions/setup-node@v4 (Node 24, npm cache)
      → npm ci
        → npm run build (outputs to dist/)
          → cloudflare/wrangler-action@v3
            → wrangler pages deploy dist --project-name=nathanrumsey-dev
              → Cloudflare Pages CDN
```

**Design choices:**

- **Cloudflare Pages**: free tier, unlimited bandwidth, global CDN, best-in-class for static sites; chosen over Netlify and Vercel for performance-per-cost on a purely static site
- **Wrangler CLI** (not Cloudflare's GitHub integration UI): keeps all config in code (`wrangler.toml`, the workflow YAML); no manual steps in the dashboard after initial project creation
- **`npm ci`** (not `npm install`): installs exact versions from `package-lock.json` for reproducible builds
- **Secrets**: `CF_API_TOKEN` and `CF_ACCOUNT_ID` are GitHub Actions secrets — the only configuration that must live outside the repo
