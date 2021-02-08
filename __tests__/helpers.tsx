import { render, RenderResult } from '@testing-library/react';
import { ThemeProvider } from 'theme-ui';
import { ethers } from 'ethers';
import WrappedAccountSelect from '../components/header/AccountSelect';
import theme from '../lib/theme';

export function renderWithTheme(component): RenderResult {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
}

export function injectProvider() {
  (window as any).ethereum = new Proxy (new ethers.providers.JsonRpcProvider('http://localhost:2000'), {
    get(target, key) {
      if (key === 'enable') {
        return async () => ['0x16Fb96a5fa0427Af0C8F7cF1eB4870231c8154B6'];
      }
      if (key === '_state') {
        return {
          accounts: ['0x16Fb96a5fa0427Af0C8F7cF1eB4870231c8154B6']
        }
      }
      // uncomment the following to debug window.ethereum errors
      // if (!target[key]) console.log(key);
      return target[key];
    }
  });
}

export function renderWithAccountSelect(component): RenderResult {
  return render(
    <>
      <ThemeProvider theme={theme}>
        <WrappedAccountSelect />
        {component}
      </ThemeProvider>
    </>
  );
}

export async function connectAccount(click, component) {
  click(await component.findByText('Connect wallet'));
  click(await component.findByText('MetaMask'));
  click(await component.findByLabelText('close'));

  try {
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
