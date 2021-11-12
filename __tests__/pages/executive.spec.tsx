import { configure, act, fireEvent, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { SWRConfig } from 'swr';
import getMaker from '../../lib/maker';
import {
  connectAccount,
  renderWithAccountSelect as render,
  createDelegate,
  switchAccount,
  DEMO_ACCOUNT_TESTS
} from '../helpers';
import { ExecutiveOverview } from '../../pages/executive';
import proposals from 'modules/executive/api/mocks/proposals.json';
import { accountsApi } from 'stores/accounts';

jest.mock('@theme-ui/match-media', () => {
  return {
    useBreakpointIndex: jest.fn(() => 3)
  };
});

const { click } = fireEvent;
let maker;

async function setup() {
  const view = render(
    <SWRConfig value={{ dedupingInterval: 0, refreshInterval: 10 }}>
      <ExecutiveOverview proposals={proposals} />
    </SWRConfig>
  );
  await act(async () => {
    await connectAccount(DEMO_ACCOUNT_TESTS);
  });
  return view;
}

describe('Executive page', () => {
  beforeAll(async () => {
    jest.setTimeout(30000);
    configure({ asyncUtilTimeout: 4500 });

    maker = await getMaker();
    await createDelegate(maker);
  });

  beforeEach(async () => {
    await setup();
  });

  test('can deposit and withdraw', async () => {
    const depositButton = await screen.findByTestId('deposit-button');

    click(depositButton);

    await screen.findByText('Approve voting contract');
    const approveButton = screen.getByTestId('deposit-approve-button');

    click(approveButton);

    await screen.findByText('Deposit into voting contract');
    const input = screen.getByTestId('mkr-input');
    fireEvent.change(input, { target: { value: '10' } });
    const finalDepositButton = await screen.findByText('Deposit MKR');
    expect(finalDepositButton).toBeEnabled();

    click(finalDepositButton);

    const withdrawButton = await screen.findByTestId('withdraw-button');

    click(withdrawButton);

    await screen.findByText('Approve voting contract');
    const approveButtonWithdraw = screen.getByTestId('withdraw-approve-button', {}, { timeout: 15000 });

    click(approveButtonWithdraw);

    await screen.findByText('Withdraw from voting contract');
    const inputWithdraw = screen.getByTestId('mkr-input');
    fireEvent.change(inputWithdraw, { target: { value: '6' } });

    const finalDepositButtonWithdraw = await screen.findByText('Withdraw MKR');

    expect(finalDepositButtonWithdraw).toBeEnabled();

    click(finalDepositButtonWithdraw);

    const dialog = screen.getByRole('dialog');
    await waitForElementToBeRemoved(dialog);

    const lockedMKR = await screen.findByTestId('locked-mkr');

    expect(lockedMKR).toHaveTextContent(/^4.000000 MKR$/); //find exact match
  });

  test('can vote', async () => {
    const [voteButtonOne] = screen.getAllByTestId('vote-button-exec-overview-card');
    click(voteButtonOne);
    const submitButton = screen.getByText('Submit Vote');
    click(submitButton);

    // wait for transaction to progress
    await screen.findByText('Confirm Transaction');
    await screen.findByText('Transaction Sent');
    await screen.findByText('Close');
  });

  test('shows delegated balance if account is a delegate', async () => {
    accountsApi.getState().addAccountsListener(maker);

    // set delegate in state
    accountsApi.getState().setVoteDelegate(accountsApi.getState().currentAccount?.address || '');

    await screen.findByText(/In delegate contract:/i);

    // switch to non-delegate account
    await switchAccount(maker);

    await screen.findByText(/In voting contract:/i);
  });
});
