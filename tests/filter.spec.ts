import { test, expect } from '@playwright/test';

// Blog — empty state and URL-driven entry

test('blog: arriving at filtered URL shows matching posts', async ({ page }) => {
  await page.goto('/blog?tag=website');
  await page.waitForSelector('article');
  await expect(page.getByRole('article').first()).toBeVisible();
});

test('blog: empty state appears with nonexistent tag', async ({ page }) => {
  await page.goto('/blog?tag=__nonexistent__');
  await expect(page.getByText('No posts match the current filters.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Clear all filters' })).toBeVisible();
});

test('blog: empty state clear-all returns results', async ({ page }) => {
  await page.goto('/blog?tag=__nonexistent__');
  await page.getByRole('button', { name: 'Clear all filters' }).click();
  await page.waitForSelector('article');
  await expect(page.getByRole('article').first()).toBeVisible();
});

// Projects — empty state and URL-driven entry

test('projects: arriving at filtered URL shows matching projects', async ({ page }) => {
  await page.goto('/projects?tag=TypeScript');
  await page.waitForSelector('article');
  await expect(page.getByRole('article').first()).toBeVisible();
});

test('projects: empty state appears with nonexistent tag', async ({ page }) => {
  await page.goto('/projects?tag=__nonexistent__');
  await expect(page.getByText('No projects match the current filters.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Clear all filters' })).toBeVisible();
});

test('projects: empty state clear-all returns results', async ({ page }) => {
  await page.goto('/projects?tag=__nonexistent__');
  await page.getByRole('button', { name: 'Clear all filters' }).click();
  await page.waitForSelector('article');
  await expect(page.getByRole('article').first()).toBeVisible();
});

// Projects — sort order

test('projects: newest sort puts nathanrumsey.dev before open-response', async ({ page }) => {
  await page.goto('/projects?sort=newest');
  await page.waitForSelector('article');
  const articles = page.getByRole('article');
  const names = await articles.evaluateAll(els => els.map(el => el.textContent ?? ''));
  const nrIdx = names.findIndex(t => t.includes('nathanrumsey.dev'));
  const orIdx = names.findIndex(t => t.includes('Open Response'));
  expect(nrIdx).toBeGreaterThanOrEqual(0);
  expect(orIdx).toBeGreaterThanOrEqual(0);
  expect(nrIdx).toBeLessThan(orIdx);
});

test('projects: oldest sort puts open-response before nathanrumsey.dev', async ({ page }) => {
  await page.goto('/projects?sort=oldest');
  await page.waitForSelector('article');
  const articles = page.getByRole('article');
  const names = await articles.evaluateAll(els => els.map(el => el.textContent ?? ''));
  const nrIdx = names.findIndex(t => t.includes('nathanrumsey.dev'));
  const orIdx = names.findIndex(t => t.includes('Open Response'));
  expect(nrIdx).toBeGreaterThanOrEqual(0);
  expect(orIdx).toBeGreaterThanOrEqual(0);
  expect(orIdx).toBeLessThan(nrIdx);
});
