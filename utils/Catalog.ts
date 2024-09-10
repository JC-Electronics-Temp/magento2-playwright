import { Page, expect } from '@playwright/test';

export default class Catalog {
  static readonly CONDITIONS = {
    'factory-sealed': 8993,
    'repacked': 8994,
    DEFAULT: 8995,
  };

  static async addProductToCart(page: Page, product: Object) {
    const {
      sku,
      qty,
      is_urgent
    } = product;

    const condition = this.CONDITIONS[product?.condition] ?? this.CONDITIONS.DEFAULT;

    await page.goto(`/${sku.toLowerCase()}`);
    await this.selectCondition(page, condition);

    switch (product?.condition) {
      case 'cashback':
        await page.click('#cashback', {force: true});

        break;

      case 'repair':
        const selector = is_urgent ? '#urgent-repair' : '#repair';
        await page.click(selector, {force: true});

        // Ensure that serial number field is available and filled
        await expect(page.locator('#repair_serial')).not.toBeDisabled();
        await page.fill('#repair_serial', 'serial_number');
        await expect(page.locator('#repair_comment')).not.toBeDisabled();
        await page.fill('#repair_comment', 'this is the comment for this repair');

        break;
    }

    await page.fill('input[name="qty"]', qty.toString());
    await page.click('#product-addtocart-button');

    const element = await page.locator('span[x-text="cart.summary_count"]');

    await page.waitForFunction(
      (el) => parseInt(el.textContent?.trim() || '0') >= 1,
      await element.elementHandle()
    );
  }

  static async selectCondition(page: Page, condition: number) {
    const inputField = page.locator(`input[value="${condition}"]`);

    await inputField.locator('..').click();
  }
}