import { TestAccountProvider } from '@makerdao/test-helpers';
import waitForExpect from 'wait-for-expect';

import { accountsApi } from '../../stores/accounts';
import getMaker from '../../lib/maker';

let maker;
beforeAll(async () => {
  maker = await getMaker();
});

test('should automatically add an account changed listener to dai.js', async () => {
  expect(accountsApi.getState().currentAccount).toBe(undefined);

  const nextAccount = TestAccountProvider.nextAccount();
  await maker.service('accounts').addAccount('test-account', {
    type: 'privateKey',
    key: nextAccount.key
  });
  maker.useAccount('test-account');

  const currentAccount = accountsApi.getState().currentAccount;
  expect(currentAccount.address).toBe(nextAccount.address);
  expect(currentAccount.name).toBe('test-account');
});

test('should connect to the browser provider and get its active account', async () => {
  const firstAccount = TestAccountProvider.nextAccount();
  const mockEnable = jest.fn(() => [firstAccount.address]);

  delete window.ethereum;
  const result = [];
  window.ethereum = {
    sendAsync: ({ method }, cb) =>
      method === 'eth_accounts'
        ? cb(null, {
            result
          })
        : null,
    enable: mockEnable,
    selectedAddress: firstAccount.address,
    chainId: 999
  };
  result[0] = firstAccount.address;

  await accountsApi.getState().connectWithBrowserProvider();
  expect(maker.currentAddress()).toBe(firstAccount.address);
  expect(accountsApi.getState().currentAccount.address).toBe(firstAccount.address);

  const secondAccount = TestAccountProvider.nextAccount();
  window.ethereum.selectedAddress = secondAccount.address;
  result[0] = secondAccount.address;
  await waitForExpect(() => {
    expect(accountsApi.getState().currentAccount.address).toEqual(secondAccount.address);
  });
});
