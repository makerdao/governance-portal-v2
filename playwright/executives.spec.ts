import { test } from './fixtures/base';
import { connectWallet } from './shared';
import './forkVnet';

test('navigates to executives and can deposit into chief', async ({ page, executivePage }) => {
  await executivePage.goto();
  await connectWallet(page);

  await executivePage.verifyVotingContract();
  await executivePage.depositIntoChief();
  await executivePage.depositMkr('0.01');
  await executivePage.verifyLockedMkr('0.01');
  await executivePage.vote();
});
