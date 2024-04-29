import { test, expect } from '@playwright/test';
import './forkVnet';

test('first test', async ({ page }) => {
  await page.goto('/');
});
