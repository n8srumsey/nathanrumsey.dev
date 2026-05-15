# nathanrumsey.dev

Personal portfolio and developer site at **[nathanrumsey.dev](https://nathanrumsey.dev)**.
Built with Astro 6, React 19, Tailwind CSS v4, TypeScript, and MDX. Deployed to Cloudflare Pages.

## Development

```bash
npm run dev       # Dev server at localhost:4321 (hot reload)
npm run build     # Build static output to dist/
npm run preview   # Serve the built dist/ locally (closer to production)
npm run check     # Astro + TypeScript type checking
npm run lint      # ESLint
npm test          # Unit tests (Vitest)
npm run test:e2e  # End-to-end tests (Playwright, builds first)
npm run test:all  # Build + unit + e2e
```

## Content

Content lives in `src/content/` as YAML and MDX files:

| Collection | Location | What it is |
|---|---|---|
| Blog posts | `src/content/blog/` | `.md` or `.mdx` files; MDX supports embedded React |
| Blog series | `src/content/series/` | `.yaml` files grouping ordered posts |
| Projects | `src/content/projects/` | `.md` or `.mdx`; MDX body generates a detail page |
| Resume | `src/content/resume/main.yaml` | Single YAML file drives the entire resume page |

See [`docs/CONTENT_GUIDE.md`](docs/CONTENT_GUIDE.md) for field reference and authoring examples.

## Deployment

Push to `main` → GitHub Actions → Cloudflare Pages. The site is fully static.

## Further Reading

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — design patterns and architectural decisions
- [`docs/CONTENT_GUIDE.md`](docs/CONTENT_GUIDE.md) — content authoring reference
