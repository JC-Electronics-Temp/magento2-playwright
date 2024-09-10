import { Page, APIRequestContext, expect } from '@playwright/test';
import checkout from '../fixtures/checkout.json';

export default class Checkout {
  static async gotoCartPage(page: Page) {
    await page.goto(checkout.routes.cart);
  }

  static async clickCheckoutButton(page: Page) {
    await page.locator('#checkout-link-button').click();
  }
}

export async function handleLoginAndCart(page: Page, loggedin: boolean) {
  if (loggedin) {
    await login(page, process.env.USER_NAME, process.env.PASSWORD);
    await page.goto('/checkout/cart');

    const rows = await page.$$('tbody.cart tr');
    if (rows.length > 0) {
      for (const row of rows) {
        const deleteButton = await row.$('button.action-delete');
        if (deleteButton) {
          await deleteButton.click();
        }
      }
    }

    await page.waitForFunction(() => {
      const rows = document.querySelectorAll('tbody.cart tr');
      return rows.length === 0;
    });
  }
}

export async function addProductToCart(page: Page, apiRequestContext: APIRequestContext, type: string, urgent: boolean) {
  const quantity_tested = urgent ? 1 : 2;
  const qty = urgent ? 2 : 1;
  let sku = await ProductUtils.getProduct(apiRequestContext, type, quantity_tested);
  
  if (type === 'repair' && urgent) {
    sku = '1746-HSCE';
  }
  
  await ProductUtils.addProductToCart(page, sku, type, urgent, qty);
  //if (type !== 'repair' && urgent) {
  //  await ProductUtils.addProductToCart(page, sku, type, urgent);
  //}
}

export async function proceedToCheckout(page: Page, loggedin: boolean, paymentMethod: string) {
	await page.goto('/checkout/');
	if (loggedin) {
		// Ensure the active address is selected for logged-in users
		await expect(page.locator('.address-grid .address-item.active')).toBeVisible();
	  } else {
		// Fetch mock data for guest users
		let country = 'US';
		if (paymentMethod == 'adyen_ideal' || paymentMethod == 'adyen_hpp_ideal') {
			country = 'NL';
		}
		const mockData = await fetchMockData(page, paymentMethod, country);
		
		// Fill in guest shipping details
		await page.getByText('Private', { exact: true }).click();
		await page.fill('#guest_details-email_address', mockData.email);
		const countryId = await page.locator('#shipping-country_id').inputValue();
		if (countryId !== mockData.country) {
			await page.selectOption('#shipping-country_id', mockData.country);
			await expect(page.getByText('Switching country')).toBeVisible();
			await expect(page.getByText('Switching country')).toBeHidden();
		}
		const vatIdField = await page.$('input.vat_id');
		if (vatIdField) {
			await page.fill('input.vat_id', mockData.TaxVat );
		}
		
		await page.fill('#shipping-postcode', mockData.zipcode, { delay: 1000} );
		
		const companyField = await page.$('#shipping-company');
		if (companyField) {
			await page.fill('#shipping-company', mockData.company);
		}
		
		if (vatIdField) {
			await expect(page.getByText('The VAT number is valid.')).toBeVisible({ timeout: 25000 });
		}
		
		const shippingRegionField = await page.$('#shipping-region');
		if (shippingRegionField) {
			await page.selectOption('#shipping-region', { label: mockData.state }, { delay: 1000} );
		}
		//await page.locator('#shipping-firstname').focus();
		
		await page.fill('#shipping-firstname', mockData.firstname);
		await page.fill('#shipping-lastname', mockData.lastname);
		await page.fill('#shipping-street-0', mockData.street);
		await page.fill('#shipping-street-1', mockData.housenumber);
		await page.fill('#shipping-telephone', mockData.phone, { delay: 1000} );
		await page.fill('#shipping-city', mockData.city, { delay: 1000} );
		//await page.waitForTimeout(5000);
		
	  }
}

export async function proceedToUrgentHandling(page: Page, urgent: boolean, type: string) {
	if (urgent && type != 'repair') {
		if (!(await page.isChecked('#urgent-handling'))) {
			await page.click('#urgent-handling');
			await expect(page.getByText('Updating urgent handling')).toBeVisible();
			//await expect(page.getByText('Updating urgent handling')).toBeHidden();
		}
	}
}

export async function proceedToShipping(page: Page) {
	// Always select the first option
	await page.waitForFunction(() => {
		const list = document.querySelectorAll('#shipping-method-list li');
		return list.length > 0;
	});
	if (await page.$('#shipping-method-list li.active') === null) {
		await page.click('#shipping-method-list li:first-child');
		await expect(page.getByText('Saving shipping method')).toBeVisible();
		await expect(page.getByText('Saving shipping method')).toBeHidden();
	}
		
		await page.waitForTimeout(2000);

	await page.click('button.btn-next');
}

export async function proceedToPayment(page: Page, paymentMethod: string, orderType:string, loggedin: boolean, orderLabel: string) {
	if (!loggedin && paymentMethod === 'companycredit') {
		if (await page.$(`li#payment-method-option-${paymentMethod}`) === null) {
			console.log('stop');
			return false;
		} else {
			console.log('why?');
			return false;
		}
	}
	
	
	if (orderType == 'cashback' && paymentMethod == 'banktransfer' && await page.$(`li#payment-method-option-${paymentMethod}`) === null) {
		console.log('stop');
		return false;
	  }
	  
	await page.waitForSelector(`li#payment-method-option-${paymentMethod}`, { state: 'visible' });

	  if (await page.$(`li#payment-method-option-${paymentMethod}.active`) === null) {
		await page.click(`#payment-method-option-${paymentMethod}`);
		//await page.waitForSelector('#magewire-loader .animate-spin', { state: 'hidden' });
		await expect(page.getByText('Saving method')).toBeVisible();
		await expect(page.getByText('Saving method')).toBeHidden();
	  }

	  if (paymentMethod === 'adyen_cc') {
		await page.frameLocator('iframe[title="Iframe for card number"]').locator('[data-fieldtype="encryptedCardNumber"]').fill('4111 1111 4555 1142');
		await page.frameLocator('iframe[title="Iframe for expiry date"]').locator('[data-fieldtype="encryptedExpiryDate"]').fill('03/30');
		await page.frameLocator('iframe[title="Iframe for security code"]').locator('[data-fieldtype="encryptedSecurityCode"]').fill('737');
		await page.fill('[name="holderName"]', 'J. Doe');
	  } else if (paymentMethod === 'adyen_ideal' || paymentMethod == 'adyen_hpp_ideal') {
		//await page.click('.adyen-checkout__dropdown__button');
		//await page.click('#listItem-1154');
	  }

	  await page.fill('#purchase-order-number', orderLabel);
	  await expect(page.locator('#purchase-order-number-section header div span.flex svg')).toBeVisible();
	  return true;
}

export async function placeOrderIfRequired(page: Page, placeOrder: boolean, paymentMethod: string) {
  if (placeOrder) {
    await page.click('.btn-place-order');
		await expect(page.getByText('Processing your order')).toBeVisible();
	
	if (paymentMethod === 'adyen_ideal' || paymentMethod == 'adyen_hpp_ideal') {
		page.waitForNavigation();
		page.locator('[data-testid="complete-payment-button"]').click();
	}
  }
  
}
