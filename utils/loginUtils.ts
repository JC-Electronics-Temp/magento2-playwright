// utils/authUtils.ts

import { Page } from '@playwright/test';

export async function login(page: Page, username: string, password: string) {
  // Navigate to the login page
  await page.goto('customer/account/login/');

  // Fill in the username
  await page.fill('#email', username);

  // Fill in the password
  await page.fill('#pass', password);

  // Click the login button
  await page.getByRole('button', { name: 'Sign In' }).click();

}