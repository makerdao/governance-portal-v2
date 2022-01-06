import { act, render, RenderResult, screen } from '@testing-library/react';
import { TestAccountProvider } from '@makerdao/test-helpers';
import { formatAddress } from 'lib/utils';
import { ThemeProvider } from 'theme-ui';
import { ethers } from 'ethers';
import WrappedAccountSelect from 'modules/app/components/layout/header/AccountSelect';
import theme from 'lib/theme';
import React from 'react';
import { accountsApi } from 'modules/app/stores/accounts';
import { createCurrency } from '@makerdao/currency';
import { AnalyticsProvider } from 'modules/app/client/analytics/AnalyticsContext';
import { CookiesProvider } from 'modules/app/client/cookies/CookiesContext';

const MKR = createCurrency('MKR');

export function renderWithTheme(component: React.ReactNode): RenderResult {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
}

export const DEMO_ACCOUNT_TESTS = '0x16Fb96a5fa0427Af0C8F7cF1eB4870231c8154B6';

// TODO: research when/why this is necesssary as it tends to cause an error "Warning: eth_requestAccounts was unsuccessful, falling back to enable"
export function injectProvider(address = DEMO_ACCOUNT_TESTS): void {
  window.ethereum = new Proxy(new ethers.providers.JsonRpcProvider('http://localhost:2000'), {
    get(target, key) {
      if (key === 'enable') {
        return async () => [address];
      }
      if (key === '_state') {
        return {
          accounts: [address]
        };
      }
      // uncomment the following to debug window.ethereum errors
      // if (!target[key]) console.log(key);
      return target[key];
    }
  });
}

export function renderWithAccountSelect(component: React.ReactNode): RenderResult {
  return render(
    <>
      <CookiesProvider disabled={true}>
        <AnalyticsProvider>
          <ThemeProvider theme={theme}>
            <WrappedAccountSelect />
            {component}
          </ThemeProvider>
        </AnalyticsProvider>
      </CookiesProvider>
    </>
  );
}

export async function connectAccount(address = DEMO_ACCOUNT_TESTS): Promise<void> {
  try {
    accountsApi.setState({
      currentAccount: {
        address,
        name: '',
        type: ''
      }
    });

    await screen.findAllByText(formatAddress(address), { exact: false }, { timeout: 15000 });
  } catch (err) {
    throw new Error('Failed to connect account in helpers.tsx.');
  }
}

export async function createTestPolls(maker) {
  // first poll is ranked choice, second is single select
  await maker
    .service('govPolling')
    .createPoll(
      1577880000,
      33134788800,
      'test',
      'https://raw.githubusercontent.com/makerdao/community/master/governance/polls/MIP14%3A%20Inclusion%20Poll%20for%20Protocol%20DAI%20Transfer%20-%20June%208%2C%202020.md'
    );
  return maker
    .service('govPolling')
    .createPoll(
      1577880000,
      33134788800,
      'test',
      'https://raw.githubusercontent.com/makerdao/community/master/governance/polls/MIP4c2-SP2%3A%20Inclusion%20Poll%20for%20MIP8%20Amendments%20-%20June%208%2C%202020.md'
    );
}

export async function createDelegate(maker, account = DEMO_ACCOUNT_TESTS) {
  await maker.service('voteDelegateFactory').createDelegateContract();
  const { voteDelegate } = await maker.service('voteDelegateFactory').getVoteDelegate(account);
  return voteDelegate.getVoteDelegateAddress();
}

// Convenience function to add a new account maker & browser provider
export async function switchAccount(maker, account = null) {
  const accountToUse = account ?? TestAccountProvider.nextAccount();
  await maker.service('accounts').addAccount(`test-account-${accountToUse.address}`, {
    type: 'privateKey',
    key: accountToUse.key
  });

  maker.useAccount(`test-account-${accountToUse.address}`);

  return accountToUse;
}

// TODO generalize this to any token & enable automatic switching to coinbase account & back
export const sendMkrToAddress = async (maker, receiver, amount) => {
  const mkr = await maker.getToken(MKR);
  await mkr.transfer(receiver, amount);
};


export const aproveDelegateContractAndAddMKR =  async (maker, voteDelegateAddress: string, mkrToDeposit: number) => {

    const mkr = await maker.getToken(MKR);
    await mkr.approveUnlimited(voteDelegateAddress);
  
    // this is only to verify the lock deposits worked, it can be deleted:
    const preLockDeposits = await maker.service('chief').getNumDeposits(voteDelegateAddress);
    console.log('preLockDeposits', preLockDeposits);
  
    await maker.service('voteDelegate').lock(voteDelegateAddress, mkrToDeposit);
  
    // this is only to verify the lock deposits worked, it can be deleted:
    const postLockDeposits = await maker.service('chief').getNumDeposits(voteDelegateAddress);
    console.log('postLockDeposits', postLockDeposits);
  
};

export const mockIntersectionObserver = jest.fn(() => ({
  root: null,
  rootMargin: '600px',
  thresholds: [1],
  disconnect: jest.fn(),
  observe: jest.fn(),
  unobserve: jest.fn(),
  takeRecords: jest.fn()
}));
