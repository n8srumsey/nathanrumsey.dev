/**
 * Converts a Content Layer entry id to a URL-friendly slug.
 * Handles both flat files (post.mdx \u2192 post) and
 * nested index files (post-name/index.mdx \u2192 post-name).
 */
export function idToSlug(id: string): string {
  return id
    .replace(/\/index\.(md|mdx)$/, '')
    .replace(/\.(md|mdx|yaml|yml)$/, '');
}
