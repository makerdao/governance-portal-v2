import { test } from './fixtures/base';
import { connectWallet } from './shared';
import './forkVnet';

test.beforeEach(async ({ page }) => {
  await page.route('api/polling/precheck*', route => {
    route.fulfill({
      status: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      contentType: 'application/json',
      body: JSON.stringify({
        recentlyUsedGaslessVoting: null,
        hasMkrRequired: true,
        alreadyVoted: false,
        relayBalance: '0.99766447864494'
      })
    });
  });
});

test('Can see legacy polls, but voting is no longer active', async ({ page, pollingPage }) => {
  await test.step('navigate to legacy polling page', async () => {
    await pollingPage.goto();
    await pollingPage.waitForPolls();
  });

  await test.step('connect wallet', async () => {
    await connectWallet(page);
  });

  await test.step('verify polls are visible but voting is disabled', async () => {
    await pollingPage.verifyPollingIsReadOnly();
  });
});
