import { test, expect } from '@playwright/test';

test('landing page loads with nav links', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Nathan Rumsey/);
  await expect(page.getByRole('navigation').getByRole('link', { name: 'Resume' })).toBeVisible();
  await expect(page.getByRole('navigation').getByRole('link', { name: 'Blog' })).toBeVisible();
  await expect(page.getByRole('navigation').getByRole('link', { name: 'Projects' })).toBeVisible();
});

test('resume page loads with sections', async ({ page }) => {
  await page.goto('/resume');
  await expect(page).toHaveTitle(/Resume/);
  await expect(page.getByRole('heading', { name: /Experience/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Education/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Skills/i })).toBeVisible();
});

test('blog index loads', async ({ page }) => {
  await page.goto('/blog');
  await expect(page).toHaveTitle(/Blog/);
  await expect(page.getByRole('heading', { name: 'Blog' })).toBeVisible();
});

test('blog post loads', async ({ page }) => {
  await page.goto('/blog/hello-world');
  await expect(page).toHaveTitle(/Hello, World/);
});

test('series page loads', async ({ page }) => {
  await page.goto('/blog/series/building-nathanrumsey-dev');
  await expect(page.getByText('Building nathanrumsey.dev')).toBeVisible();
});

test('projects catalog loads', async ({ page }) => {
  await page.goto('/projects');
  await expect(page).toHaveTitle(/Projects/);
});

test('project detail page loads', async ({ page }) => {
  await page.goto('/projects/nathanrumsey-dev');
  await expect(page).toHaveTitle(/nathanrumsey\.dev/);
});

test('RSS feed is accessible', async ({ page }) => {
  const response = await page.goto('/rss.xml');
  expect(response?.status()).toBe(200);
});

test('sitemap is accessible', async ({ page }) => {
  const response = await page.goto('/sitemap-index.xml');
  expect(response?.status()).toBe(200);
});

test('nav routes correctly from landing page', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation').getByRole('link', { name: 'Blog' }).click();
  await expect(page).toHaveURL('/blog');
});
