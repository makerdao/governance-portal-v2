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

test('Can see polls, but cannot vote on them', async ({ page, pollingPage }) => {
  await test.step('navigate to polling page', async () => {
    await pollingPage.goto();
    await pollingPage.waitForPolls();
  });

  await test.step('connect wallet', async () => {
    await connectWallet(page);
  });

  await test.step('verify voting weight', async () => {
    await pollingPage.verifyVotingWeight('150,001 MKR');
  });

  await test.step('select poll choice but cannot add to ballot', async () => {
    await pollingPage.selectChoice('Yes');
    await pollingPage.verifyAddToBallotDisabled();
  });

  await test.step('review ballot button is disabled', async () => {
    await pollingPage.verifyReviewBallotDisabled();
  });
});
