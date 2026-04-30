import { test, expect } from '@playwright/test';

test('can login then log out', async ({ page }) => {
    await page.goto('');

    // Click the R button.
    await page.getByRole('button', { name: 'Open settings' }).click();

    // Sign Up and Login shows up
    await page.getByText(/Login/).click();

    // Expects page to have a Login in the header.
    await expect(page.getByText(/Login/)).toBeVisible();

    // type email and password
    await page.getByLabel('Email').fill('caloy@a.co');
    await page.getByLabel('Password').fill('caloy123');

    // click Login button
    await page.getByRole('button', { name: 'Login' }).click();

    // Expects page to be in Main...
    await expect(page.getByText(/Main\.\.\./)).toBeVisible();

    // Click the R button.
    await page.getByText(/^R$/).click();

    // Shows email
    await expect(page.getByText(/caloy@a\.co/)).toBeVisible();

    // then logout
    await page.getByText(/Logout/).click();

    // Click the R button.
    await page.getByRole('button', { name: 'Open settings' }).click();

    // Expects page to have a Login in the header.
    await expect(page.getByText(/Login/)).toBeVisible();

    // No email
    await expect(page.getByText(/caloy@a\.co/)).toBeHidden();
});