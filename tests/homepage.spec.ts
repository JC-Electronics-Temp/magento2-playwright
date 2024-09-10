const { test, expect } = require('@playwright/test');

test.describe('Homepage', () => {
    test('Search Field', async ({ page }) => {
        await page.goto(process.env.PLAYWRIGHT_BASE_URL);
    });
});
