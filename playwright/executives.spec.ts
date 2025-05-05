import { expect, test } from './fixtures/base';
import { connectWallet } from './shared';
import './forkVnet';
import { depositMkr } from './helpers/depositMkr';

test('navigates to executives and can withdraw from chief', async ({ page, executivePage }) => {
  await test.step('navigate to executives page', async () => {
    await executivePage.goto();
  });

  await test.step('connect wallet', async () => {
    await connectWallet(page);
  });

  await test.step('verify chief contract deposits are disabled', async () => {
    await executivePage.verifyDepositDisabled();
  });

  await test.step('withdraw from chief contract', async () => {
    // Deposit MKR into the Chief through an RPC call directly since it's not possible from the app
    const depositSuccessful = await depositMkr('0.01');
    expect(depositSuccessful).toBe(true);

    await page.reload();
    await connectWallet(page);

    await executivePage.verifyVotingContract();
    await executivePage.verifyLockedMkr('0.01');

    await executivePage.withdrawFromChief();
    await executivePage.withdrawMkr('0.01');
    await executivePage.verifyLockedMkr('0');
  });
});
