import { test } from './fixtures/base';
import { connectWallet } from './shared';
import './forkVnet';

test('delegate MKR', async ({ page, delegatePage }) => {
  await test.step('navigate to delegate page', async () => {
    await delegatePage.goto();
  });

  await test.step('connect wallet', async () => {
    await connectWallet(page);
  });

  // TODO: V2 delegates don't show up in tenderly e2e fork as contracts so their delegated amount doesn't show up
  // neither does the delegation actions work
  await test.step('sort delegates and perform delegation', async () => {
    await delegatePage.sortByHighestFirst();
    await delegatePage.delegate('2');
    await delegatePage.verifyDelegatedAmount('2');
  });

  await test.step('undelegate MKR', async () => {
    await delegatePage.undelegate();
  });

  // TODO: The remove funds from delegate test is not working well because the modal keeps showing the button
  // To approve the contract, even it's approved. We have to approve it like 3 times to work
  // Check what is the problem and uncomment the following code
  /*
  await delegatePage.undelegateAll();
  */
});
