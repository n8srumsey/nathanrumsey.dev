import { test } from '@playwright/test';
import { checkA11y, injectAxe } from 'axe-playwright';

const routes = [
  { path: '/', label: 'landing' },
  { path: '/about', label: 'about' },
  { path: '/resume', label: 'resume' },
  { path: '/blog', label: 'blog index' },
  { path: '/blog/hello-world', label: 'blog post' },
  { path: '/blog/series/building-nathanrumsey-dev', label: 'series page' },
  { path: '/projects', label: 'projects catalog' },
  { path: '/projects/nathanrumsey-dev', label: 'project detail: nathanrumsey.dev' },
  { path: '/projects/open-response', label: 'project detail: OpenResponse' },
  { path: '/projects/ai-hybrid-search', label: 'project detail: AI Hybrid Search' },
  { path: '/under-construction', label: 'under construction' },
];

const axeOptions = {
  runOnly: {
    type: 'tag' as const,
    values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
  },
};

for (const { path, label } of routes) {
  test(`a11y: ${label} (${path})`, async ({ page }) => {
    await page.goto(path);
    await injectAxe(page);
    await checkA11y(page, undefined, {
      axeOptions,
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });
}
