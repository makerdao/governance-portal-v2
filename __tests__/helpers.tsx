import { act, render, RenderResult } from '@testing-library/react';
import { formatAddress } from 'lib/utils';
import { ThemeProvider } from 'theme-ui';
import { ethers } from 'ethers';
import WrappedAccountSelect from '../components/header/AccountSelect';
import theme from '../lib/theme';
import React from 'react';
import { accountsApi } from 'stores/accounts';

export function renderWithTheme(component: React.ReactNode): RenderResult {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
}

export const DEMO_ACCOUNT_TESTS = '0x16Fb96a5fa0427Af0C8F7cF1eB4870231c8154B6';

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
      <ThemeProvider theme={theme}>
        <WrappedAccountSelect />
        {component}
      </ThemeProvider>
    </>
  );
}

export async function connectAccount(component, address = DEMO_ACCOUNT_TESTS) {
  try {
    accountsApi.setState({
      currentAccount: {
        address,
        name: '',
        type: ''
      }
    });

    await component.findAllByText(formatAddress(address), { exact: false }, { timeout: 15000 });
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
