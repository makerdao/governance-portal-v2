import getMaker from 'lib/maker';
import { accountsApi } from 'stores/accounts';

export async function useAccountChange() {
  // if we are on the browser start listening for account changes as soon as possible
  if (typeof window !== 'undefined') {
    const maker = await getMaker();
    accountsApi.getState().addAccountsListener(maker);
  }
}
