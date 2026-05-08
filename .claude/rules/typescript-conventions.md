# TypeScript Conventions

Minimal starting point — expand as patterns solidify.

## General

- Strict mode is implicit via Astro's tsconfig. Do not weaken it.
- Prefer `type` over `interface` for object shapes that won't be extended. Use `interface` when declaration merging or class implementation is needed.
- Avoid `any`. Use `unknown` when the type is genuinely unknown, then narrow.
- Export types alongside the functions that use them. Co-locate, don't centralize.

## Naming

- Files: `camelCase.ts` for utilities, `PascalCase.astro` for Astro components, `PascalCase.tsx` for React components.
- Types and interfaces: `PascalCase`.
- Functions and variables: `camelCase`.

## Imports

- Use named imports. Default exports are fine for components and pages (Astro convention), but prefer named exports for utilities.
- Import order: external packages, then internal (use path aliases if configured).

## Astro-Specific

- `.astro` files are server-only by default. Do not import browser-only APIs at the top level.
- Add `client:*` directives only when interactivity requires it — prefer server rendering.
- Use `Astro.props` type via `interface Props` declared inside the component frontmatter.

## Icons

- Never hard-code SVG markup inline in a page or component. Always wrap it in a named icon component.
- For Astro files: create a `PascalCaseIcon.astro` component in `src/components/` with a `size` prop (default matches typical use). See `SeriesIcon.astro`, `ChevronLeftIcon.astro`, `ChevronRightIcon.astro` as examples.
- For React files: create a `PascalCaseIcon.tsx` component in `src/components/` with a `size` prop. Do not define icon functions inline inside other components. Do not import `.astro` components into `.tsx` files. See `LayersIcon.tsx`, `GitHubIcon.tsx`, `GlobeIcon.tsx`, `ChevronRightIcon.tsx` as examples.
- Both forms must set `aria-hidden="true"` — icons are decorative; labels belong on the surrounding element.

## Content Layer

- Never read content files directly. Always use `getCollection` / `getEntry` from `astro:content`.
- Slug derivation is always via `idToSlug()` from `src/utils/slugs.ts` — never inline the logic.
