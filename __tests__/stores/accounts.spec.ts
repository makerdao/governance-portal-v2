import { TestAccountProvider } from '@makerdao/test-helpers';
import waitForExpect from 'wait-for-expect';

import { accountsApi } from '../../stores/accounts';
import getMaker from '../../lib/maker';

let maker;
describe('Store accounts', () => {
  beforeAll(async () => {
    maker = await getMaker();
    accountsApi.getState().addAccountsListener(maker);
  });
  
  test('should automatically add an account changed listener to dai.js', async () => {
    expect(accountsApi.getState().currentAccount).toBeUndefined();
  
    const nextAccount = TestAccountProvider.nextAccount();
    await maker.service('accounts').addAccount('test-account', {
      type: 'privateKey',
      key: nextAccount.key
    });
    maker.useAccount('test-account');
    await waitForExpect(() => {
      const currentAccount = accountsApi.getState().currentAccount;
      expect(currentAccount?.address).toBe(nextAccount.address);
      expect(currentAccount?.name).toBe('test-account');
    });
  });
    
});