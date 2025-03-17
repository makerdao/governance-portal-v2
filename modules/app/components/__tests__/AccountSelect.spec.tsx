/**
 * @jest-environment jsdom
 */

/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { renderWithTheme as render } from '../../../../__tests__/helpers';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import WrappedAccountSelect from 'modules/app/components/layout/header/AccountSelect';
import { vi } from 'vitest';

vi.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: '',
      asPath: '',
      push: vi.fn(),
      events: {
        on: vi.fn(),
        off: vi.fn()
      },
      beforePopState: vi.fn(() => null),
      prefetch: vi.fn(() => null)
    };
  }
}));

describe('Account select', () => {
  test('can connect an account', async () => {
    render(<WrappedAccountSelect />);
    const connectButton = await screen.findByText('Connect wallet');
    expect(connectButton).toBeInTheDocument();

    userEvent.click(connectButton);

    const metamaskButton = await screen.findByText('MetaMask');
    expect(metamaskButton).toBeInTheDocument();
  });
});
