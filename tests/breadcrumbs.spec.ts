import { test, expect } from '@playwright/test';

test('blog post has breadcrumb with Blog link', async ({ page }) => {
  await page.goto('/blog/hello-world');
  const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
  await expect(breadcrumb).toBeVisible();
  await expect(breadcrumb.getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '/blog');
});

test('blog post in series has series crumb linking to series page', async ({ page }) => {
  await page.goto('/blog/hello-world');
  const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
  const seriesCrumb = breadcrumb.getByRole('link', { name: /Building nathanrumsey\.dev/ });
  await expect(seriesCrumb).toBeVisible();
  await expect(seriesCrumb).toHaveAttribute('href', '/blog/series/building-nathanrumsey-dev');
});

test('blog index card shows series badge linking to series page', async ({ page }) => {
  await page.goto('/blog');
  await page.waitForLoadState('networkidle');
  const badge = page.getByRole('link', { name: /Building nathanrumsey\.dev/ }).first();
  await expect(badge).toBeVisible();
  await expect(badge).toHaveAttribute('href', '/blog/series/building-nathanrumsey-dev');
});

test('series page has breadcrumb with Blog link', async ({ page }) => {
  await page.goto('/blog/series/building-nathanrumsey-dev');
  const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
  await expect(breadcrumb).toBeVisible();
  await expect(breadcrumb.getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '/blog');
});

test('project detail page has breadcrumb with Projects link', async ({ page }) => {
  await page.goto('/projects/nathanrumsey-dev');
  const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
  await expect(breadcrumb).toBeVisible();
  await expect(breadcrumb.getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '/projects');
});
