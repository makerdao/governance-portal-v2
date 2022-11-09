/**
 * @jest-environment jsdom
 */
import { renderWithTheme as render } from '../../../../__tests__/helpers';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import WrappedAccountSelect from 'modules/app/components/layout/header/AccountSelect';
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
