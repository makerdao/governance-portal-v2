import { renderWithTheme as render } from '../../../../__tests__/helpers';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import WrappedAccountSelect from 'modules/app/components/layout/header/AccountSelect';
import { useRouter } from 'next/router';
jest.mock('next/router');

describe('Account select', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ pathname : '' });
  });
  test('can connect an account', async () => {
    render(<WrappedAccountSelect />);
    const connectButton = await screen.findByText('Connect wallet');
    expect(connectButton).toBeInTheDocument();

    userEvent.click(connectButton);

    const metamaskButton = await screen.findByText('MetaMask');
    expect(metamaskButton).toBeInTheDocument();
  });
});
