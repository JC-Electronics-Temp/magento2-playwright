import { Page, APIRequestContext, request as playwrightRequest, expect } from '@playwright/test';

class ProductUtils {
  // Fetch Product function
  static async 	getProduct(apiContext: APIRequestContext, condition: string, qty_tested: number) {
	  condition = condition.toLowerCase();
	  if (condition === 'repair') {
		return this.getProductRepair(apiContext, condition, qty_tested);
	  }

	  const catalogId = this.getConditionId(condition);
	  let qty_tested_condition = 'gt';
	  if (qty_tested === 1) {
		qty_tested_condition = '=';
	  }

	  async function fetchProduct(page = 1): Promise<string | null> {
		let url = `/rest/V1/products/?searchCriteria[filter_groups][0][filters][0][field]=quantity_tested` +
		  `&searchCriteria[filter_groups][0][filters][0][condition_type]=${qty_tested_condition}` +
		  `&searchCriteria[filter_groups][0][filters][0][value]=${qty_tested}` +
		  `&searchCriteria[filter_groups][1][filters][0][field]=product_box_type` +
		  `&searchCriteria[filter_groups][1][filters][0][value]=${catalogId}` +
		  `&searchCriteria[filter_groups][1][filters][0][condition_type]==` +
		  `&searchCriteria[filter_groups][2][filters][0][field]=status` +
		  `&searchCriteria[filter_groups][2][filters][0][value]=1` +
		  `&searchCriteria[filter_groups][2][filters][0][condition_type]==`;

		if (condition === 'cashback') {
		  url += `&searchCriteria[filter_groups][3][filters][0][field]=cashback_price` +
			`&searchCriteria[filter_groups][3][filters][0][value]=0` +
			`&searchCriteria[filter_groups][3][filters][0][condition_type]=gt`;
		}

		url += `&searchCriteria[pageSize]=1&searchCriteria[currentPage]=${page}&fields=items[sku,quantity_tested,status]`;
		console.log(url);

		const response = await apiContext.get(url, {
		  headers: {
			authorization: `Bearer ${process.env.MAGENTO2_ADMIN_TOKEN}`
		  }
		});
		const responseBody = await response.json();

		if (responseBody.items.length === 0) {
		  console.log('Geen producten gevonden');
		  return null;
		}

		let product = responseBody.items[0];
		let sku = product.sku;

		const stockResponse = await apiContext.get(`/rest/V1/stockItems/${sku}`, {
		  headers: {
			authorization: `Bearer ${process.env.MAGENTO2_ADMIN_TOKEN}`
		  }
		});
		const stockItem = await stockResponse.json();
		console.log(stockItem);

		if (stockItem.qty > 0) {
		  sku = sku.replace(' Refurbished', '').replace(' New factory sealed', '').replace(' New JC-E repacked', '');
		  return sku;
		} else {
		  console.log('Geen voorraad, probeer een ander product');
		  return await fetchProduct(page + 1);
		}
	  }

	  return fetchProduct(Math.floor(Math.random() * 100) + 1);
	}
	
	static async getProductRepair(apiContext: APIRequestContext, condition: string, qty_tested: number) {
	  const response = await apiContext.get(`/rest/V1/products/?searchCriteria[filter_groups][1][filters][0][field]=repair_price` +
		`&searchCriteria[filter_groups][1][filters][0][condition_type]=gt` +
		`&searchCriteria[filter_groups][1][filters][0][value]=100` +
		`&searchCriteria[filter_groups][2][filters][0][field]=status` +
		`&searchCriteria[filter_groups][2][filters][0][value]=1` +
		`&searchCriteria[filter_groups][2][filters][0][condition_type]==` +
		`&searchCriteria[pageSize]=2&fields=items[sku,status,stock_item]`, {
		headers: {
		  authorization: `Bearer ${process.env.MAGENTO2_ADMIN_TOKEN}`
		}
	  });

	  const responseBody = await response.json();
	  return responseBody.items[0].sku.replace(' Refurbished', '');
	}
	
	

  // Add Product to Cart function
  static async addProductToCart(page: Page, sku: string, condition: string, urgent: boolean = false, qty: integer = 1) {
    console.log(`Parameters - Page: ${page}, SKU: ${sku}, Condition: ${condition}, Urgent: ${urgent}`);
	if (condition) condition = condition.toLowerCase();

    await page.goto(`/${sku}`);
				
    if (condition) {
      if (condition === 'cashback') {
        await this.setCondition(page, 'refurbished');
        await page.click('#cashback', { force: true });
      } else if (condition === 'repair') {
        await page.click('#repair', { force: true });

        if (urgent) {
          await page.click('#urgent-repair', { force: true });
        }

        await expect(page.locator('#repair_serial')).not.toBeDisabled();
        await page.fill('#repair_serial', 'serial_number');

        await expect(page.locator('#repair_comment')).not.toBeDisabled();
        await page.fill('#repair_comment', 'this is the comment for this repair');
      } else {
        await this.setCondition(page, condition);
      }
    }
	await page.fill('input[name="qty"]', qty.toString());
	
    await page.click('#product-addtocart-button');

    const element = await page.locator('span[x-text="cart.summary_count"]');

    await page.waitForFunction(
		(el) => parseInt(el.textContent?.trim() || '0') >= 1,
		await element.elementHandle()
	  );

    console.log('Product added to cart and count is 1 or higher.');
  }

  // Set Condition function
  static async setCondition(page: Page, condition: string) {
    const conditionId = this.getConditionId(condition);
    const conditionInput = page.locator(`input[value="${conditionId}"]`);
    //await expect(conditionInput).toBeVisible();
    await conditionInput.locator('..').click();
  }

  // Get Condition ID function
  static getConditionId(condition: string): number {
    console.log(condition);
    let conditionId = 0;
    switch (condition) {
      case 'refurbished':
        conditionId = 8995;
        break;
      case 'new jc-e repacked':
        conditionId = 8994;
        break;
      case 'cashback':
        conditionId = 8995;
        break;
      case 'repair':
        conditionId = 8995;
        break;
      default:
        conditionId = 8993;
        break;
    }
    return conditionId;
  }
}

export { ProductUtils };
