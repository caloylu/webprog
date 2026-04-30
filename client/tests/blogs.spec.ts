import { test, expect } from '@playwright/test';

test('can filter specific blog', async ({ page }) => {
  await page.goto('');
  await expect(page.getByRole('button', { name: 'Blog' })).toBeVisible();
  
  await page.getByRole('button', { name: 'Blog' }).click();
  await expect(page.getByRole('heading', { name: 'Blogs' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '1', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: '2', exact: true })).toBeVisible();

  await expect(page.getByRole('rowheader', { name: 'Loy' }).first()).toBeVisible();
  await expect(page.getByRole('cell', { name: 'btbtgrt5gb' })).toBeVisible();

  await page.getByRole('textbox', { name: 'Filter' }).click();
  await page.getByRole('textbox', { name: 'Filter' }).fill('bless');
  await page.getByRole('button', { name: 'Apply Filter' }).click();
  await expect(page.getByText(/btbtgrt5gb/)).toBeVisible();
});