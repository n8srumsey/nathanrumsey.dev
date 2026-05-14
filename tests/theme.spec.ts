import { test, expect } from '@playwright/test';

test('theme toggle button is present in nav', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: /Switch to (light|dark) mode/i });
  await expect(toggle).toBeVisible();
});

test('clicking toggle switches to light mode', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Switch to light mode' });
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.getByRole('button', { name: 'Switch to dark mode' })).toBeVisible();
});

test('clicking toggle twice returns to dark mode', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Switch to light mode' });
  await toggle.click();
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'light');
});

test('light mode preference persists across page reloads', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});
