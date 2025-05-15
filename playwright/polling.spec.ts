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
  pollingPage,
  executivePage
}) => {
  const selectedPollId = 1507;

  // first we need to deposit SKY to chief since wallet balance no longer counts for poll voting
  await test.step('navigate to executives page', async () => {
    await executivePage.goto();
  });
  await test.step('connect wallet', async () => {
    await connectWallet(page);
  });

  await test.step('verify and deposit into chief contract', async () => {
    await executivePage.verifyVotingContract();
    await executivePage.depositIntoChief();
    await executivePage.depositMkr('0.01');
    await executivePage.verifyLockedMkr('0.01');
  });

  await test.step('navigate to polling page', async () => {
    await pollingPage.goto();
    await pollingPage.waitForPolls();
  });

  await test.step('connect wallet', async () => {
    await connectWallet(page);
  });

  await test.step('select poll choice and add to ballot', async () => {
    await pollingPage.selectChoice('Yes');
    await pollingPage.addToBallot();
  });

  await test.step('review and edit ballot', async () => {
    await pollingPage.navigateToReview();
    await pollingPage.verifyPollId(selectedPollId);
    await pollingPage.editChoice('No');
  });

  await test.step('submit vote using legacy system', async () => {
    await pollingPage.submitBallot();
    await pollingPage.switchToLegacyVoting();
    await pollingPage.submitLegacyVote();
    await pollingPage.verifyVoteSubmission();
  });
});

//Skip this test because eth_signTypedData_v4 doesn't work with the mock connector
//We'd need to find a way to update the CustomizedBridge to handle eth_signTypedData_v4 to get this to work.
test.skip('Adds polls to review and navigates to review page and votes with the gasless system', async ({
  page,
  pollingPage
}) => {
  const selectedPollId = 1107;

  await test.step('navigate to polling page', async () => {
    await pollingPage.goto();
    await pollingPage.waitForPolls();
  });

  await test.step('connect wallet', async () => {
    await connectWallet(page);
  });

  await test.step('select poll choice and add to ballot', async () => {
    await pollingPage.selectChoice('Yes');
    await pollingPage.addToBallot();
  });

  await test.step('review and edit ballot', async () => {
    await pollingPage.navigateToReview();
    await pollingPage.verifyPollId(selectedPollId);
    await pollingPage.editChoice('No');
  });

  await test.step('submit vote using gasless system', async () => {
    await pollingPage.submitBallot();
    await pollingPage.submitGaslessVote();
  });
});
