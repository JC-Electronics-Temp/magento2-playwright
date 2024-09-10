import { Page } from '@playwright/test';

export async function fetchMockData(page: Page, paymentMethod: string, country: string) {
  let file = 'accdataoutsideeu';
  if (country === 'NL') {
	file = 'users';
  }
  const response = await page.request.get(`https://my.api.mockaroo.com/${file}.json?key=1fa729b0`);
  const data = await response.json();

  // Adjust the country based on payment method if needed
  if (paymentMethod === 'adyen_ideal' || paymentMethod === 'adyen_hpp_ideal') {
    data.country = 'NL';
	data.zipcode = '8913 cv';
  } else if (paymentMethod === 'adyen_sofort') {
    data.country = 'DE';
  }

  return data;
}
