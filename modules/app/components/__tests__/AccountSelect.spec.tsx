import { renderWithTheme as render, connectAccount } from '../../../../__tests__/helpers';
import userEvent from '@testing-library/user-event';
import { act, screen } from '@testing-library/react';
import WrappedAccountSelect from 'modules/app/components/layout/header/AccountSelect';

xdescribe('Account select', () => {
  test('can connect an account', async () => {
    render(<WrappedAccountSelect />);
    const connectButton = await screen.findByText('Connect wallet');
    expect(connectButton).toBeInTheDocument();

    userEvent.click(connectButton);

    const metamaskButton = await screen.findByText('MetaMask');

    userEvent.click(metamaskButton);

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
