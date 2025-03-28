/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { screen } from '@testing-library/react';
import Header from '../layout/Header';
import { renderWithTheme as render } from '../../../../__tests__/helpers';
import { formatAddress } from 'lib/utils';
import { useSingleDelegateInfo } from 'modules/delegates/hooks/useSingleDelegateInfo';
import { useAccount } from 'modules/app/hooks/useAccount';
import { vi, Mock } from 'vitest';

vi.mock('modules/delegates/hooks/useSingleDelegateInfo');
vi.mock('modules/app/hooks/useAccount');
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

describe('Header component', () => {
  beforeEach(() => {
    (useSingleDelegateInfo as Mock).mockReturnValue({ data: null });
    (useAccount as Mock).mockReturnValue({
      account: ''
    });
  });

  test('finds icons and an empty connect button', async () => {
    render(<Header />);
    const [makerIcon] = await screen.findAllByRole('presentation');

    expect(makerIcon).toBeInTheDocument();

    const accountConnection = screen.queryByText(/Connect wallet/);
    expect(accountConnection).toBeInTheDocument();
  });

  test('display account when connected', async () => {
    const address = '0x477b8D5eF7C2C42DB84deB555419cd817c336b6J';

    (useAccount as Mock).mockReturnValue({
      account: address
    });

    // TODO, figure out what code is making this trigger an act error. Probably some hook trying to do an async call
    render(<Header />);
    const accountConnection = screen.queryByText(/Connect wallet/);
    expect(accountConnection).not.toBeInTheDocument();

    const connectedWallet = screen.getByTestId('connected-address');
    const formatted = formatAddress(address).toLowerCase();
    expect(connectedWallet?.textContent).toEqual(formatted);
  });
});
