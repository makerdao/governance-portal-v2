import { test } from './fixtures/base';
import { connectWallet } from './shared';
import './forkVnet';

test.skip('Can view Sky governance polls', async ({ page }) => {
  await test.step('navigate to Sky polling page', async () => {
    await page.goto('/polling'); // New Sky polling page
  });

  await test.step('verify Sky polls are displayed', async () => {
    await page.waitForSelector('[data-testid="sky-poll-overview-card"]');
    // TODO: Add more assertions for Sky polls
  });
});

test.skip('Can interact with Sky polls', async ({ page }) => {
  await test.step('navigate to Sky polling page', async () => {
    await page.goto('/polling');
  });

  await test.step('connect wallet', async () => {
    await connectWallet(page);
  });

  await test.step('verify Sky voting options', async () => {
    // TODO: Add test steps for Sky voting functionality
    await page.waitForSelector('[data-testid="sky-poll-overview-card"]');
  });
});