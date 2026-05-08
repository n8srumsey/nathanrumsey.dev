# Component Abstraction

## The distinction

The general "don't prematurely abstract" guidance applies to logic. UI components have a lower extraction threshold: the visual and behavioral pattern is rigid and predictable, so duplication costs more and extraction costs less.

## When to extract

**Second use is a strong signal.** If you find yourself writing the same visual+behavioral pattern a second time — same markup shape, icon treatment, interaction, and semantic role together — step back and extract a component rather than duplicate inline.

**First use, clear reuse ahead.** If a pattern is designed to appear in multiple places by construction (a catalog card, a metadata link row, a status badge), create the component at first use rather than inlining and refactoring later.

**Before writing a new UI structure**, consider whether the pattern already exists in the codebase. If it does, reuse or extend rather than duplicate.

## What doesn't trigger extraction

Style-only repetition is fine inline. Several elements sharing a few Tailwind classes don't need a component. The trigger is *structure + behavior as a unit* — markup shape, icon, interactive state, and semantic role together.

## Relationship to icon conventions

The icon conventions in `typescript-conventions.md` apply here: when extracting a component that embeds an icon, ensure the icon itself is also a named component (not inline SVG), and choose the right form (`.tsx` for React context, `.astro` for Astro-only context).
