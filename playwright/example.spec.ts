import { test, expect } from '@playwright/test';

test('first test', async ({ page }) => {
  await page.goto('/');
});
