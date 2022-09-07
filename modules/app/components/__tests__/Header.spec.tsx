/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import Header from '../layout/Header';
import { renderWithTheme as render } from '../../../../__tests__/helpers';
import { useWeb3React } from '@web3-react/core';
import { formatAddress } from 'lib/utils';
import { useDelegateAddressMap } from 'modules/delegates/hooks/useDelegateAddressMap';
import { useAccount } from 'modules/app/hooks/useAccount';

jest.mock('modules/delegates/hooks/useDelegateAddressMap');
jest.mock('@web3-react/core');
jest.mock('modules/app/hooks/useAccount');
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: '',
      asPath: '',
      push: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn()
      },
      beforePopState: jest.fn(() => null),
      prefetch: jest.fn(() => null)
    };
  }
}));

jest.mock('modules/web3/connections', () => ({ connectorToWalletName: () => null }));

describe('Header component', () => {
  beforeEach(() => {
    (useWeb3React as jest.Mock).mockReturnValue({
      account: ''
    });
    (useDelegateAddressMap as jest.Mock).mockReturnValue({ data: {} });
    (useAccount as jest.Mock).mockReturnValue({
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

    (useWeb3React as jest.Mock).mockReturnValue({
      account: address,
      activate: () => null
    });
    (useAccount as jest.Mock).mockReturnValue({
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
