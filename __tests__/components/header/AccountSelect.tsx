import { renderWithTheme as render, connectAccount } from '../../helpers';
import { act, fireEvent, screen } from '@testing-library/react';
import WrappedAccountSelect from '../../../components/header/AccountSelect';
import { accountsApi } from 'stores/accounts';

const { click } = fireEvent;

describe('Account select', () => {
  beforeAll(async () => {
    accountsApi.getState().addAccountsListener();

    jest.setTimeout(30000);
  });


  test('can connect an account', async () => {

    const view = render(<WrappedAccountSelect />);
    const connectButton = await screen.findByText('Connect wallet');
    expect(connectButton).toBeInTheDocument();

    click(connectButton);

    const metamaskButton = await screen.findByText('MetaMask');

    click(metamaskButton);

    await act(async () => {
      await connectAccount();
    });
    const copyButton = await screen.findByTestId('copy-address');
    expect(copyButton).toBeInTheDocument();
    const etherscanButton = await screen.findByText('etherscan', { exact: false });
    expect(etherscanButton).toBeInTheDocument();
    const displayedAddress = await screen.findAllByText('0x16F', { exact: false });
    expect(displayedAddress.length).toBe(1);

    // Wait for MKR balance to load
    await screen.findByText(/400.00 MKR/i);
  });
});
