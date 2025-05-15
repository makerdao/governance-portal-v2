import { test, expect } from '@playwright/test';
import { connectWallet } from './shared';
import './forkVnet';

test('ESM data is rendered in read only mode', async ({ page }) => {
  await page.goto('/esmodule');

  await expect(page.locator('text=Emergency Shutdown Module')).toBeVisible();

  await connectWallet(page);

  await expect(page.locator('[data-testid="total-mkr-esmodule-staked"]')).toBeVisible();

  await expect(page.locator('text=Burn Your MKR')).toBeVisible();

  await page.waitForLoadState('networkidle');

  // The burn MKR button remains disabled in read mode
  await expect(page.locator('text=Burn Your MKR')).toBeDisabled();

  // ESM History events are displayed in the table
  const rowCount = await page.locator('tr').count();
  expect(rowCount).toBeGreaterThanOrEqual(1);
});
