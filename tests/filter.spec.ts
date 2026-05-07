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

test('blog: clear-all preserves sort state', async ({ page }) => {
  await page.goto('/blog?tag=typescript&sort=oldest');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Clear all' }).click();
  await expect(page).toHaveURL(/sort=oldest/);
  await expect(page).not.toHaveURL(/tag=/);
});

test('blog: active filter chips are shown when filters are active', async ({ page }) => {
  await page.goto('/blog?tag=typescript');
  await page.waitForLoadState('networkidle');
  await expect(page.getByText('Filters:')).toBeVisible();
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
