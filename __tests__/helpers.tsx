import { act, render, RenderResult } from '@testing-library/react';
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

export function injectProvider(): void {
  window.ethereum = new Proxy (new ethers.providers.JsonRpcProvider('http://localhost:2000'), {
    get(target, key) {
      if (key === 'enable') {
        return async () => [DEMO_ACCOUNT_TESTS];
      }
      if (key === '_state') {
        return {
          accounts: [DEMO_ACCOUNT_TESTS]
        }
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

export async function connectAccount(component) {
  

  try {
    accountsApi.setState({ currentAccount: {
      address: DEMO_ACCOUNT_TESTS,
      name: '',
      type: ''
    } });

    await component.findAllByText('0x16F', { exact: false });
  } catch (err) {
    throw new Error('Failed to connect account in helpers.tsx.');
  }
}

export async function createTestPolls(maker) {
  // first poll is ranked choice, second is single select
  await maker.service('govPolling').createPoll(
    1577880000,
    33134788800,
    'test',
    'https://raw.githubusercontent.com/makerdao/community/master/governance/polls/MIP14%3A%20Inclusion%20Poll%20for%20Protocol%20DAI%20Transfer%20-%20June%208%2C%202020.md'
  );
  return maker.service('govPolling').createPoll(
    1577880000,
    33134788800,
    'test',
    'https://raw.githubusercontent.com/makerdao/community/master/governance/polls/MIP4c2-SP2%3A%20Inclusion%20Poll%20for%20MIP8%20Amendments%20-%20June%208%2C%202020.md'
  );
}
