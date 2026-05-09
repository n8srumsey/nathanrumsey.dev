import { test, expect } from '@playwright/test';

// Blog filter tests

test('blog: clicking a tag on a card filters by that tag', async ({ page }) => {
  await page.goto('/blog');
  await page.waitForLoadState('networkidle');
  const tagButton = page.getByRole('button', { name: 'typescript' }).first();
  await tagButton.click();
  await expect(page).toHaveURL(/[?&]tag=typescript/);
  await expect(page.getByRole('article').first()).toBeVisible();
});

test('blog: arriving at filtered URL shows only matching posts', async ({ page }) => {
  await page.goto('/blog?tag=typescript');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/tag=typescript/);
  await expect(page.getByRole('article').first()).toBeVisible();
});

test('blog: empty state appears with nonexistent tag', async ({ page }) => {
  await page.goto('/blog?tag=__nonexistent__');
  await page.waitForLoadState('networkidle');
  await expect(page.getByText('No posts match the current filters.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Clear all filters' })).toBeVisible();
});

test('blog: empty state clear-all link is always reachable (no dead-end)', async ({ page }) => {
  await page.goto('/blog?tag=__nonexistent__');
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('button', { name: 'Clear all filters' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear all filters' }).click();
  await expect(page.getByRole('article').first()).toBeVisible();
});

test('blog: clear preserves sort state', async ({ page }) => {
  await page.goto('/blog?tag=typescript&sort=oldest');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Clear Filters' }).first().click();
  await expect(page).toHaveURL(/sort=oldest/);
  await expect(page).not.toHaveURL(/tag=/);
});

test('blog: active tag chip appears in toolbar when filter is active', async ({ page }) => {
  await page.goto('/blog?tag=typescript');
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('button', { name: 'Remove tag: typescript' })).toBeVisible();
});

test('blog: filter panel opens on Filter button click', async ({ page }) => {
  await page.goto('/blog');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Filter', exact: true }).click();
  await expect(page.getByPlaceholder('Search tags…')).toBeVisible();
});

test('blog: tag autocomplete shows matching options when typing', async ({ page }) => {
  await page.goto('/blog');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Filter', exact: true }).click();
  await page.getByPlaceholder('Search tags…').fill('type');
  await expect(page.getByRole('option', { name: 'typescript' })).toBeVisible();
});

test('blog: selecting tag from autocomplete adds chip to toolbar strip', async ({ page }) => {
  await page.goto('/blog');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Filter', exact: true }).click();
  await page.getByPlaceholder('Search tags…').fill('type');
  await page.getByRole('option', { name: 'typescript' }).click();
  await expect(page.getByRole('button', { name: 'Remove tag: typescript' })).toBeVisible();
  await expect(page).toHaveURL(/tag=typescript/);
});

// Project filter tests

test('projects: clicking a tag on a card filters by that tag', async ({ page }) => {
  await page.goto('/projects');
  await page.waitForLoadState('networkidle');
  const tagButton = page.getByRole('button', { name: 'go', exact: true }).first();
  await tagButton.click();
  await expect(page).toHaveURL(/[?&]tag=go/);
  await expect(page.getByRole('article').first()).toBeVisible();
});

test('projects: empty state appears with nonexistent tag', async ({ page }) => {
  await page.goto('/projects?tag=__nonexistent__');
  await page.waitForLoadState('networkidle');
  await expect(page.getByText('No projects match the current filters.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Clear all filters' })).toBeVisible();
});

test('projects: empty state clear-all link is always reachable (no dead-end)', async ({ page }) => {
  await page.goto('/projects?tag=__nonexistent__');
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('button', { name: 'Clear all filters' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear all filters' }).click();
  await expect(page.getByRole('article').first()).toBeVisible();
});

test('projects: tag autocomplete adds chip to toolbar strip', async ({ page }) => {
  await page.goto('/projects');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Tags', exact: true }).click();
  await page.getByPlaceholder('Search tags…').fill('go');
  await page.getByRole('option', { name: 'go', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Remove tag: go' })).toBeVisible();
  await expect(page).toHaveURL(/tag=go/);
});

test('projects: boolean toggle filters results', async ({ page }) => {
  await page.goto('/projects');
  await page.waitForLoadState('networkidle');
  const articlesBefore = await page.getByRole('article').count();
  await page.getByRole('button', { name: 'Featured' }).click();
  await expect(page).toHaveURL(/featured=true/);
  const articlesAfter = await page.getByRole('article').count();
  expect(articlesAfter).toBeLessThanOrEqual(articlesBefore);
});

test('projects: newest sort puts nathanrumsey.dev before OpenResponse', async ({ page }) => {
  await page.goto('/projects?sort=newest');
  await page.waitForLoadState('networkidle');
  const articles = page.getByRole('article');
  const names = await articles.evaluateAll(els => els.map(el => el.textContent ?? ''));
  const nrIdx = names.findIndex(t => t.includes('nathanrumsey.dev'));
  const orIdx = names.findIndex(t => t.includes('OpenResponse'));
  expect(nrIdx).toBeGreaterThanOrEqual(0);
  expect(orIdx).toBeGreaterThanOrEqual(0);
  expect(nrIdx).toBeLessThan(orIdx);
});

test('projects: oldest sort puts OpenResponse before nathanrumsey.dev', async ({ page }) => {
  await page.goto('/projects?sort=oldest');
  await page.waitForLoadState('networkidle');
  const articles = page.getByRole('article');
  const names = await articles.evaluateAll(els => els.map(el => el.textContent ?? ''));
  const nrIdx = names.findIndex(t => t.includes('nathanrumsey.dev'));
  const orIdx = names.findIndex(t => t.includes('OpenResponse'));
  expect(nrIdx).toBeGreaterThanOrEqual(0);
  expect(orIdx).toBeGreaterThanOrEqual(0);
  expect(orIdx).toBeLessThan(nrIdx);
});

test('projects: dateless projects appear after dated projects in newest sort', async ({ page }) => {
  await page.goto('/projects?sort=newest');
  await page.waitForLoadState('networkidle');
  const articles = page.getByRole('article');
  const names = await articles.evaluateAll(els => els.map(el => el.textContent ?? ''));
  const nrIdx = names.findIndex(t => t.includes('nathanrumsey.dev'));
  const orIdx = names.findIndex(t => t.includes('OpenResponse'));
  const homelabIdx = names.findIndex(t => t.includes('Homelab'));
  expect(nrIdx).toBeLessThan(homelabIdx);
  expect(orIdx).toBeLessThan(homelabIdx);
});

test('projects: featured first sort orders dated featured projects by newest within group', async ({ page }) => {
  await page.goto('/projects?sort=featured');
  await page.waitForLoadState('networkidle');
  const articles = page.getByRole('article');
  const names = await articles.evaluateAll(els => els.map(el => el.textContent ?? ''));
  const nrIdx = names.findIndex(t => t.includes('nathanrumsey.dev'));
  const orIdx = names.findIndex(t => t.includes('OpenResponse'));
  const homelabIdx = names.findIndex(t => t.includes('Homelab'));
  // Both dated featured projects appear before dateless featured project
  expect(nrIdx).toBeLessThan(homelabIdx);
  expect(orIdx).toBeLessThan(homelabIdx);
  // nathanrumsey.dev (today) is newer than OpenResponse (2025-06), so appears first
  expect(nrIdx).toBeLessThan(orIdx);
});
