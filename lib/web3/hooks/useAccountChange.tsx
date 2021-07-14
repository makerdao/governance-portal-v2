import { accountsApi } from 'stores/accounts';

export function useAccountChange() {
  // if we are on the browser start listening for account changes as soon as possible
  if (typeof window !== 'undefined') {
    accountsApi.getState().addAccountsListener();
  }
}
