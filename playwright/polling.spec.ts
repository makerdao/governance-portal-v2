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

test('Adds polls to review and navigates to review page and votes with the legacy system', async ({
  page,
  pollingPage
}) => {
  const selectedPollId = 1107;

  await pollingPage.goto();
  await pollingPage.waitForPolls();
  await connectWallet(page);

  await pollingPage.selectChoice('Yes');
  await pollingPage.addToBallot();
  await pollingPage.navigateToReview();
  await pollingPage.verifyPollId(selectedPollId);
  await pollingPage.editChoice('No');
  await pollingPage.submitBallot();
  await pollingPage.switchToLegacyVoting();
  await pollingPage.submitLegacyVote();
  await pollingPage.verifyVoteSubmission();
});

//Skip this test because eth_signTypedData_v4 doesn't work with the mock connector
//We'd need to find a way to update the CustomizedBridge to handle eth_signTypedData_v4 to get this to work.
test('Adds polls to review and navigates to review page and votes with the gasless system', async ({
  page,
  pollingPage
}) => {
  const selectedPollId = 1107;

  await pollingPage.goto();
  await pollingPage.waitForPolls();
  await connectWallet(page);

  await pollingPage.selectChoice('Yes');
  await pollingPage.addToBallot();
  await pollingPage.navigateToReview();
  await pollingPage.verifyPollId(selectedPollId);
  await pollingPage.editChoice('No');
  await pollingPage.submitBallot();
  await pollingPage.submitGaslessVote();
});
