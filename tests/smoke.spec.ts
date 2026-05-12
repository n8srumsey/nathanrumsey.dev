import { test, expect } from '@playwright/test';

test('landing page loads with nav links', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Nathan Rumsey/);
  const topNav = page.getByRole('navigation', { name: 'Main navigation' });
  await expect(topNav.getByRole('link', { name: 'About' })).toBeVisible();
  await expect(topNav.getByRole('link', { name: 'Resume' })).toBeVisible();
  await expect(topNav.getByRole('link', { name: 'Blog' })).toBeVisible();
  await expect(topNav.getByRole('link', { name: 'Projects' })).toBeVisible();
  await expect(page.getByRole('contentinfo').getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', /linkedin\.com/);
});

test('landing page hero and callouts are visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByText('Latest Post')).toBeVisible();
  await expect(page.getByText('Featured Project')).toBeVisible();
  await expect(page.getByRole('link', { name: 'All posts' })).toHaveAttribute('href', '/blog');
  await expect(page.getByRole('link', { name: 'All projects' })).toHaveAttribute('href', '/projects');
});

test('landing page callout links navigate correctly', async ({ page }) => {
  await page.goto('/');
  const postLink = page.locator('text=Latest Post').locator('..').getByRole('link').first();
  const href = await postLink.getAttribute('href');
  expect(href).toMatch(/^\/blog\//);
});

test('about page loads', async ({ page }) => {
  await page.goto('/about');
  await expect(page).toHaveTitle(/About/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('main').getByRole('link', { name: /GitHub/i })).toHaveAttribute('href', /github\.com/);
  await expect(page.getByRole('main').getByRole('link', { name: /LinkedIn/i })).toHaveAttribute('href', /linkedin\.com/);
});

test('resume page loads with sections', async ({ page }) => {
  await page.goto('/resume');
  await expect(page).toHaveTitle(/Resume/);
  await expect(page.getByRole('heading', { name: /Experience/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Education/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Projects/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Skills/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /OpenResponse/i })).toBeVisible();
  await expect(page.getByRole('main').getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', /github\.com/);
  await expect(page.getByRole('main').getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', /linkedin\.com/);
});

test('blog index loads', async ({ page }) => {
  await page.goto('/blog');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveTitle(/Blog/);
  await expect(page.getByRole('heading', { name: 'Blog' })).toBeVisible();
  await expect(page.getByRole('article').first()).toBeVisible();
});

test('blog post loads', async ({ page }) => {
  await page.goto('/blog/hello-world');
  await expect(page).toHaveTitle(/Hello, World/);
});

test('series page loads', async ({ page }) => {
  await page.goto('/blog/series/building-nathanrumsey-dev');
  await expect(page.getByRole('heading', { name: 'Building nathanrumsey.dev' })).toBeVisible();
});

test('projects catalog loads', async ({ page }) => {
  await page.goto('/projects');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveTitle(/Projects/);
  await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
});

test('project detail page loads', async ({ page }) => {
  await page.goto('/projects/nathanrumsey-dev');
  await expect(page).toHaveTitle(/nathanrumsey\.dev/);
});

test('under-construction page loads', async ({ page }) => {
  await page.goto('/under-construction');
  await expect(page).toHaveTitle(/Under Construction/);
  await expect(page.getByRole('heading', { name: 'Under Construction' })).toBeVisible();
});

test('RSS feed is accessible', async ({ page }) => {
  const response = await page.goto('/rss.xml');
  expect(response?.status()).toBe(200);
});

// TODO: sitemap test requires a static file server (astro preview does not serve plugin-generated
// assets). Switch webServer to `npx serve dist/` and resolve the port-reuse issue before enabling.
// test('sitemap is accessible', ...)

test('nav routes correctly from landing page', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Main navigation').getByRole('link', { name: 'Blog' }).click();
  await expect(page).toHaveURL('/blog');
});
