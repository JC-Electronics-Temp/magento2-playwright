import { test, expect } from '@playwright/test';
import { Catalog, Checkout } from '../utils';
import checkout from '../fixtures/checkout.json';
test.describe('Checkout', () => {
  checkout.shippingAddresses.forEach((address) => {
    test.describe(`Shipping ${address.title}`, () => {
      /* Add selected products to cart */
      address.products.forEach((product) => {
        test(`Add Product ${product.sku} to the Cart`, async ({page}) => {
          await Catalog.addProductToCart(page, product);
        });
      });

      /* Go to the cart and click the "Proceed to Checkout" button */
      test('Go to the Cart', async ({page}) => {
        await Checkout.gotoCartPage(page);
        await Checkout.clickCheckoutButton(page);
      });

      /* Fill in the checkout form */
      // test('Fill in the Shipping Address Form', async ({page}) => {
      //
      // });
    });
  });
});