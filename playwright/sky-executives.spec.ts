import { test } from './fixtures/base';
import { connectWallet } from './shared';
import './forkVnet';

test.skip('Can view Sky executives', async ({ page }) => {
  await test.step('navigate to Sky executives page', async () => {
    await page.goto('/executive'); // New page shows Sky executives
  });

  await test.step('verify Sky executives are displayed', async () => {
    await page.waitForSelector('[data-testid="sky-executive-overview-card"]');
    // TODO: Add more assertions for Sky executives
  });
});

test.skip('Can interact with Sky executives', async ({ page }) => {
  await test.step('navigate to Sky executives page', async () => {
    await page.goto('/executive');
  });

  await test.step('connect wallet', async () => {
    await connectWallet(page);
  });

  await test.step('verify Sky voting functionality is disabled', async () => {
    // TODO: Add test steps for Sky executive voting (which should be disabled)
    await page.waitForSelector('[data-testid="sky-executive-overview-card"]');
  });
});