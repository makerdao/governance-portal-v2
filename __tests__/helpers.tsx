import { render, RenderResult, screen } from '@testing-library/react';
import { formatAddress } from 'lib/utils';
import { ThemeProvider } from 'theme-ui';
import WrappedAccountSelect from 'modules/app/components/layout/header/AccountSelect';
import theme from 'lib/theme';
import React from 'react';
import { accountsApi } from 'modules/app/stores/accounts';
import { AnalyticsProvider } from 'modules/app/client/analytics/AnalyticsContext';
import { CookiesProvider } from 'modules/app/client/cookies/CookiesContext';

export function renderWithTheme(component: React.ReactNode): RenderResult {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
}

export const DEMO_ACCOUNT_TESTS = '0x16Fb96a5fa0427Af0C8F7cF1eB4870231c8154B6';

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

export const mockIntersectionObserver = jest.fn(() => ({
  root: null,
  rootMargin: '600px',
  thresholds: [1],
  disconnect: jest.fn(),
  observe: jest.fn(),
  unobserve: jest.fn(),
  takeRecords: jest.fn()
}));
