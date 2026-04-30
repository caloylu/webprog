import { test, expect } from '@playwright/test';

test.describe('public pages', () => {

    test('can view products', async ({ page }) => {
        await page.goto('/products');

        // Expects page to have a Products heading
        await expect(page.getByRole('heading', { name: 'Products', level: 2 })).toBeVisible();

        // Expects page to have Description.
        await expect(page.getByRole('columnheader', { name: 'Description' })).toBeVisible();

        // No New/Edit
        // await expect(page.getByText(/Name/)).toBeHidden();
        // await expect(page.getByText(/Edit/)).toBeHidden();
    });


    test('can filter products', async ({ page }) => {
        await page.goto('/products');

        // Expects page to have a Products heading
        await expect(page.getByRole('heading', { name: 'Products', level: 2 })).toBeVisible();

        // type filter
        const name = 'Awesome'
        await page.getByLabel('Filter').fill(name);

        // click Apply Filter button
        await page.getByRole('button', { name: 'Apply Filter' }).click();

        // Expects page to have the filtered products
        await expect((await page.getByRole('rowheader', { name: name }).all()).length).toBeGreaterThan(0)
    });
});

test.describe('secured pages', () => {

    test.beforeEach(async ({ page }) => {
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
        await expect(page.getByText('Main...')).toBeVisible();

        // Go to Products
        await page.getByRole('button', { name: 'Products' }).click();
    });

    test('can create new product', async ({ page }) => {
        // then click New
        await page.getByText(/New/).click();

        // Expects page to be in Add Product
        await expect(page.getByText(/Add Product/)).toBeVisible();

        // type name, description, price and quantity
        const name = `Product ${Date.now()}`
        const description = `Description for ${name}`
        await page.getByLabel('Name').fill(name)
        await page.getByLabel('Description').fill(description)
        await page.getByLabel('Price').fill('69')
        await page.getByLabel('Quantity').fill('123')

        // click Save button
        await page.getByRole('button', { name: 'Save' }).click();

        // type filter
        await page.getByLabel('Filter').fill(name);

        // click Apply Filter button
        await page.getByRole('button', { name: 'Apply Filter' }).click();

        // Expects page to have the new product
        await expect(page.getByRole('cell', { name: name })).toBeVisible();
        await expect(page.getByRole('cell', { name: description })).toBeVisible();

        // we can later delete so as not to clutter our database
    });

    test('can update product', async ({ page }) => {
        // type filter of previously created but not deleted products
        await page.getByLabel('Filter').fill('Product 17');

        // click Apply Filter button
        await page.getByRole('button', { name: 'Apply Filter' }).click();

        // then click New
        await page.getByText(/Edit/).nth(0).click();

        // Expects page to be in Add Product
        await expect(page.getByText(/Edit Product/)).toBeVisible();

        // type name and description
        const name = `Product Updated ${Date.now()}`
        const description = `Description Updated for ${name}`
        await page.getByLabel('Name').fill(name)
        await page.getByLabel('Description').fill(description)
        await page.getByLabel('Price').fill('14344')
        await page.getByLabel('Quantity').fill('99')

        // click Save button
        await page.getByRole('button', { name: 'Save' }).click();

        // type filter
        await page.getByLabel('Filter').fill(name);

        // click Apply Filter button
        await page.getByRole('button', { name: 'Apply Filter' }).click();

        // Expects page to have the updated product
        await expect(page.getByRole('cell', { name: name })).toBeVisible();
        await expect(page.getByRole('cell', { name: description })).toBeVisible();
    });
});