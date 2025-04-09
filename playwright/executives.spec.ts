import { test } from './fixtures/base';
import { connectWallet } from './shared';
import './forkVnet';

test('navigates to executives and can deposit into chief', async ({ page, executivePage }) => {
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

  await test.step('vote on executive', async () => {
    await executivePage.vote();
  });
});
