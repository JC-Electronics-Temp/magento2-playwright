import { test, expect } from '@playwright/test';
import { ProductUtils } from '../utils/catalogUtils';
import { handleLoginAndCart, addProductToCart, proceedToCheckout, proceedToUrgentHandling, proceedToShipping, proceedToPayment	, placeOrderIfRequired } from '../utils/checkoutUtils';

test.describe('Shipping costs', () => {

  test('Shipping: > 10kg, € 2000 product', async ({ page }) => {
    await ProductUtils.addProductToCart(page, '6SE7021-3EB20');
    await page.goto('/checkout');

    const countries = ["NL", "FR", "PL", "HU", "BG", "US", "VN"];
	const validZipCodes = { "NL": "8913 cv", "FR": "75001", "PL": "00-001", "HU": "1051", "US": "10001", "VN": "700000" };
    const standardCosts = ["€0.00", "€0.00", "€0.00", "€0.00", "€0.00", "€0.00", "€0.00"];
    const standardMethods = ["ust01", "ust01", "ust01", "fec01", "fec02", "fec02", "fec02"];
    const standardTimes = ["2", "2", "3", "3", "3", "5", "5"];
    const expressCosts = ["€40.00", "€80.00", "€90.00", "€90.00", "€90.00", "€160.00", "€190.00"];
    const expressMethods = ["usa01", "usa01", "usa01", "fed_e", "fed_e", "fed_e", "fed_e"];
    const expressTimes = ["1", "1", "2", "2", "2", "3", "3"];
    let i = 0;

    for (const country of countries) {
		
	  await page.selectOption('#shipping-country_id', { value: country }, { delay: 1000} );
	  const elements = page.locator('text=Switching country');
	  await expect(elements.last()).toBeVisible();
	  await expect(elements.last()).toBeHidden();
	  await page.fill('#shipping-postcode', validZipCodes[country], { delay: 1000} );
	  if (country == "US") {
		const shippingRegionField = await page.$('#shipping-region');
		if (shippingRegionField) {
			await page.selectOption('#shipping-region', { label: "Alabama" }, { delay: 1000} );
		}
	  }
	  
	  if (standardCosts[i] == "€0.00") standardCosts[i] = "Free"

      await expect(page.locator(`#shipping-method-option-${standardMethods[i]} span`).first()).toContainText(standardCosts[i]);
      await expect(page.locator(`#shipping-method-option-${standardMethods[i]}`)).toBeVisible();
      await expect(page.locator(`#shipping-method-option-${standardMethods[i]} .text-sm`)).toContainText(`, delivery within ${standardTimes[i]} working day`);

      await expect(page.locator(`#shipping-method-option-${expressMethods[i]} span`).first()).toContainText(expressCosts[i]);
      await expect(page.locator(`#shipping-method-option-${expressMethods[i]}`)).toBeVisible();
      await expect(page.locator(`#shipping-method-option-${expressMethods[i]} .text-sm`)).toContainText(`, delivery within ${expressTimes[i]} working day`);

      i++;
    }
  });

  test('Shipping: < 10kg, € 500 product', async ({ page }) => {
    await ProductUtils.addProductToCart(page, '6SE7018-0ES87-2DA0');
    await page.goto('/checkout');

    const countrySelect = page.locator('#shipping-country_id');
    const countries = ["NL", "FR", "PL", "HU", "US", "VN"];
	const validZipCodes = { "NL": "8913 cv", "FR": "75001", "PL": "00-001", "HU": "1051", "US": "10001", "VN": "700000" };
    const standardCosts = ["€0.00", "€0.00", "€0.00", "€0.00", "€65.00", "€80.00"];
    const standardMethods = ["ust01", "ust01", "ust01", "fec01", "fec02", "fec02"];
    const standardTimes = ["2", "2", "3", "3", "5", "5"];
    const expressCosts = ["€30.00", "€60.00", "€70.00", "€70.00", "€135.00", "€140.00"];
    const expressMethods = ["usa01", "usa01", "usa01", "fed_e", "fed_e", "fed_e"];
    const expressTimes = ["1", "1", "2", "2", "3", "3"];
    let i = 0;

    for (const country of countries) {
      let method = 0;

	  await page.selectOption('#shipping-country_id', { value: country }, { delay: 1000} );
			await expect(page.getByText('Switching country')).toBeVisible();
			await expect(page.getByText('Switching country')).toBeHidden();
	  await page.fill('#shipping-postcode', validZipCodes[country], { delay: 1000} );
	  if (country == "US") {
		const shippingRegionField = await page.$('#shipping-region');
		if (shippingRegionField) {
			await page.selectOption('#shipping-region', { label: "Alabama" }, { delay: 1000} );
		}
	  }

      await expect(page.locator('#shipping-method-list li')).toHaveCount(3);

      await expect(page.locator('#shipping-method-list label').nth(method).locator('div').nth(3)).toContainText(standardCosts[i]);
      await expect(page.locator(`#shipping-method-option-${standardMethods[i]}`)).toBeVisible();
      await expect(page.locator(`#shipping-method-option-${standardMethods[i]} .text-sm`)).toContainText(`, ${standardTimes[i]} working day`);

      method++;

      await expect(page.locator('#shipping-method-list label').nth(method).locator('div').nth(3)).toContainText(expressCosts[i]);
      await expect(page.locator(`#shipping-method-option-${expressMethods[i]}`)).toBeVisible();
      await expect(page.locator(`#shipping-method-option-${expressMethods[i]} .text-sm`)).toContainText(`, ${expressTimes[i]} working day`);

      i++;
    }
  });

  test('Shipping: < 3kg, € 102 product', async ({ page }) => {
    await ProductUtils.addProductToCart(page, '6AV3572-1FX00');
    await page.goto('/checkout');

    const countries = ["NL", "FR", "PL", "HU", "US", "VN"];
	const validZipCodes = { "NL": "8913 cv", "FR": "75001", "PL": "00-001", "HU": "1051", "US": "10001", "VN": "700000" };
    const standardCosts = ["€8.00", "€10.00", "€10.00", "€20.00", "€35.00", "€35.00"];
    const standardMethods = ["ust01", "ust01", "ust01", "fec01", "fec02", "fec02"];
    const standardTimes = ["2", "2", "3", "3", "5", "5"];
    const expressCosts = ["€20.00", "€50.00", "€50.00", "€50.00", "€50.00", "€100.00"];
    const expressMethods = ["usa01", "usa01", "usa01", "fed_e", "fed_e", "fed_e"];
    const expressTimes = ["1", "1", "2", "2", "3", "3"];
    let i = 0;

    for (const country of countries) {
      let method = 0;

	  await page.selectOption('#shipping-country_id', { value: country }, { delay: 1000} );
  	  await expect(page.getByText('Switching country')).toBeVisible();
      await expect(page.getByText('Switching country')).toBeHidden();
			
	  await page.fill('#shipping-postcode', validZipCodes[country], { delay: 1000} );
	  if (country == "US") {
		const shippingRegionField = await page.$('#shipping-region');
		if (shippingRegionField) {
			await page.selectOption('#shipping-region', { label: "Alabama" }, { delay: 1000} );
		}
	  }
	  
      await expect(page.locator('#shipping-method-list li')).toHaveCount(3);

      await expect(page.locator('#shipping-method-list label').nth(method).locator('div').nth(3)).toContainText(standardCosts[i]);
      await expect(page.locator(`#shipping-method-option-${standardMethods[i]}`)).toBeVisible();
      await expect(page.locator(`#shipping-method-option-${standardMethods[i]} .text-sm`)).toContainText(`, ${standardTimes[i]} working day`);

      method++;

      await expect(page.locator('#shipping-method-list label').nth(method).locator('div').nth(3)).toContainText(expressCosts[i]);
      await expect(page.locator(`#shipping-method-option-${expressMethods[i]}`)).toBeVisible();
      await expect(page.locator(`#shipping-method-option-${expressMethods[i]} .text-sm`)).toContainText(`, ${expressTimes[i]} working day`);

      i++;
    }
  });

  test('Shipping: > 3kg < 10kg, € 102 product', async ({ page }) => {
    await ProductUtils.addProductToCart(page, '6AV2100-0AA01-0AA0');
    await page.goto('/checkout');

    const countries = ["NL", "FR", "PL", "HU", "US", "VN"];
	const validZipCodes = { "NL": "8913 cv", "FR": "75001", "PL": "00-001", "HU": "1051", "US": "10001", "VN": "700000" };
    const standardCosts = ["€10.00", "€15.00", "€15.00", "€21.00", "€65.00", "€80.00"];
    const standardMethods = ["ust01", "ust01", "ust01", "fec01", "fec02", "fec02"];
    const standardTimes = ["2", "2", "3", "3", "5", "5"];
    const expressCosts = ["€30.00", "€70.00", "€70.00", "€70.00", "€135.00", "€140.00"];
    const expressMethods = ["usa01", "usa01", "usa01", "fed_e", "fed_e", "fed_e"];
    const expressTimes = ["1", "1", "2", "2", "3", "3"];
    let i = 0;

    for (const country of countries) {
      let method = 0;

	  await page.selectOption('#shipping-country_id', { value: country }, { delay: 1000} );
			await expect(page.getByText('Switching country')).toBeVisible();
			await expect(page.getByText('Switching country')).toBeHidden();
	  await page.fill('#shipping-postcode', validZipCodes[country], { delay: 1000} );
	  if (country == "US") {
		const shippingRegionField = await page.$('#shipping-region');
		if (shippingRegionField) {
			await page.selectOption('#shipping-region', { label: "Alabama" }, { delay: 1000} );
		}
	  }

		
      await expect(page.locator('#shipping-method-list li')).toHaveCount(3);

      await expect(page.locator('#shipping-method-list label').nth(method).locator('div').nth(3)).toContainText(standardCosts[i]);
      await expect(page.locator(`#shipping-method-option-${standardMethods[i]}`)).toBeVisible();
      await expect(page.locator(`#shipping-method-option-${standardMethods[i]} .text-sm`)).toContainText(`, ${standardTimes[i]} working day`);

      method++;

      await expect(page.locator('#shipping-method-list label').nth(method).locator('div').nth(3)).toContainText(expressCosts[i]);
      await expect(page.locator(`#shipping-method-option-${expressMethods[i]}`)).toBeVisible();
      await expect(page.locator(`#shipping-method-option-${expressMethods[i]} .text-sm`)).toContainText(`, ${expressTimes[i]} working day`);

      i++;
    }
  });

  test('Shipping: > 100kg, pallet product', async ({ page }) => {
    await ProductUtils.addProductToCart(page, '6se7032-1tg60');
    await page.goto('/checkout');

    const countries = ["NL", "FR", "PL", "HU", "US", "VN"];
	const validZipCodes = { "NL": "8913 cv", "FR": "75001", "PL": "00-001", "HU": "1051", "US": "10001", "VN": "700000" };
    const standardCosts = ["€250.00", "€275.00", "€275.00", "€350.00", "€1,200.00", "€1,300.00"];
    const standardMethods = ["cec01", "cec01", "cec01", "cec01", "fef01", "fef01"];
    const standardTimes = ["5", "5", "5", "5", "5", "8"];
    const expressCosts = ["€450.00", "€750.00", "€750.00", "€975.00", "€1,800.00", "€1,900.00"];
    const expressMethods = ["fpf01", "fpf01", "fpf01", "fpf01", "fpf01", "fpf01"];
    const expressTimes = ["3", "3", "3", "3", "3", "5"];
    let i = 0;

    for (const country of countries) {
      let method = 0;

	  await page.selectOption('#shipping-country_id', { value: country }, { delay: 1000} );
			await expect(page.getByText('Switching country')).toBeVisible();
			await expect(page.getByText('Switching country')).toBeHidden();
	  await page.fill('#shipping-postcode', validZipCodes[country], { delay: 1000} );
	  if (country == "US") {
		const shippingRegionField = await page.$('#shipping-region');
		if (shippingRegionField) {
			await page.selectOption('#shipping-region', { label: "Alabama" }, { delay: 1000} );
		}
	  }

      await expect(page.locator('#shipping-method-list label').nth(method).locator('div').nth(3)).toContainText(standardCosts[i]);
      await expect(page.locator(`#shipping-method-option-${standardMethods[i]}`)).toBeVisible();
      await expect(page.locator(`#shipping-method-option-${standardMethods[i]} .text-sm`)).toContainText(`, ${standardTimes[i]} working day`);

      method++;

      await expect(page.locator('#shipping-method-list label').nth(method).locator('div').nth(3)).toContainText(expressCosts[i]);
      await expect(page.locator(`#shipping-method-option-${expressMethods[i]}`)).toBeVisible();
      await expect(page.locator(`#shipping-method-option-${expressMethods[i]} .text-sm`)).toContainText(`, ${expressTimes[i]} working day`);

      i++;
    }
  });

  test('Shipping: < 100kg, pallet product', async ({ page }) => {
    await ProductUtils.addProductToCart(page, '6SE7031-2EF70');
    await page.goto('/checkout');

    const countries = ["NL", "FR", "PL", "HU", "US", "VN"];
	const validZipCodes = { "NL": "8913 cv", "FR": "75001", "PL": "00-001", "HU": "1051", "US": "10001", "VN": "700000" };
    const standardCosts = ["€150.00", "€175.00", "€175.00", "€250.00", "€750.00", "€900.00"];
    const standardMethods = ["cec01", "cec01", "cec01", "cec01", "fef01", "fef01"];
    const standardTimes = ["5", "5", "5", "5", "5", "8"];
    const expressCosts = ["€350.00", "€600.00", "€600.00", "€600.00", "€1,400.00", "€1,400.00"];
    const expressMethods = ["fpf01", "fpf01", "fpf01", "fpf01", "fpf01", "fpf01"];
    const expressTimes = ["3", "3", "3", "3", "3", "5"];
    let i = 0;

    for (const country of countries) {
      let method = 0;

	  await page.selectOption('#shipping-country_id', { value: country }, { delay: 1000} );
			await expect(page.getByText('Switching country')).toBeVisible();
			await expect(page.getByText('Switching country')).toBeHidden();
	  await page.fill('#shipping-postcode', validZipCodes[country], { delay: 1000} );
	  if (country == "US") {
		const shippingRegionField = await page.$('#shipping-region');
		if (shippingRegionField) {
			await page.selectOption('#shipping-region', { label: "Alabama" }, { delay: 1000} );
		}
	  }

      await expect(page.locator('#shipping-method-list label').nth(method).locator('div').nth(3)).toContainText(standardCosts[i]);
      await expect(page.locator(`#shipping-method-option-${standardMethods[i]}`)).toBeVisible();
      await expect(page.locator(`#shipping-method-option-${standardMethods[i]} .text-sm`)).toContainText(`, ${standardTimes[i]} working day`);

      method++;

      await expect(page.locator('#shipping-method-list label').nth(method).locator('div').nth(3)).toContainText(expressCosts[i]);
      await expect(page.locator(`#shipping-method-option-${expressMethods[i]}`)).toBeVisible();
      await expect(page.locator(`#shipping-method-option-${expressMethods[i]} .text-sm`)).toContainText(`, ${expressTimes[i]} working day`);

      i++;
    }
  });

});
