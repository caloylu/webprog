import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/client/);
});

test('has logo', async ({ page }) => {
    await page.goto('');

    // Expects page to have a LOGO in the header.
    await expect(page.getByRole('link', { name: 'LOGO' })).toBeVisible();
});

test('can go to About', async ({ page }) => {
    await page.goto('');

    // Click the get About button.
    await page.getByRole('button', { name: 'About' }).click();

    // Expects page to have a About later...
    await expect(page.getByText('About...')).toBeVisible();
});

test('has Sign Up and Login', async ({ page }) => {
    await page.goto('');

    // Click the R button.
    await page.getByText(/^R$/).click();

    // Sign Up and Login shows up
    await expect(page.getByText(/Sign Up/)).toBeVisible();
    await expect(page.getByText(/Login/)).toBeVisible();
});

test('can go to Products', async ({ page }) => {
    await page.goto('');

    // Click the get About button.
    await page.getByRole('button', { name: 'Products' }).click();

    // Expects page to have a Products heading
    await expect(page.getByRole('heading', { name: 'Products', level: 2 })).toBeVisible();
});