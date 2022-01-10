import { configure, act, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
import { accountsApi } from 'modules/app/stores/accounts';

jest.mock('@theme-ui/match-media', () => {
  return {
    useBreakpointIndex: jest.fn(() => 3)
  };
});

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

describe('/executive page', () => {
  beforeAll(async () => {
    jest.setTimeout(30000);
    configure({ asyncUtilTimeout: 4500 });

    maker = await getMaker();
    await createDelegate(maker);
  });

  beforeEach(async () => {
    await setup();
  });

  test('can deposit and withdraw into chief', async () => {
    const depositButton = await screen.findByTestId('deposit-button');

    userEvent.click(depositButton);

    await screen.findByText('Approve voting contract');
    const approveButton = screen.getByTestId('deposit-approve-button');

    userEvent.click(approveButton);

    await screen.findByText('Deposit into voting contract');
    const input = screen.getByTestId('mkr-input');
    userEvent.type(input, '10');
    const finalDepositButton = await screen.findByText('Deposit MKR');
    expect(finalDepositButton).toBeEnabled();

    userEvent.click(finalDepositButton);

    const withdrawButton = await screen.findByTestId('withdraw-button');

    userEvent.click(withdrawButton);

    await screen.findByText('Approve voting contract');
    const approveButtonWithdraw = screen.getByTestId('withdraw-approve-button', {}, { timeout: 15000 });

    userEvent.click(approveButtonWithdraw);

    await screen.findByText('Withdraw from voting contract');
    const inputWithdraw = screen.getByTestId('mkr-input');
    userEvent.type(inputWithdraw, '6');

    const finalDepositButtonWithdraw = await screen.findByText('Withdraw MKR');

    expect(finalDepositButtonWithdraw).toBeEnabled();

    userEvent.click(finalDepositButtonWithdraw);

    const dialog = screen.getByRole('dialog');
    await waitForElementToBeRemoved(dialog);

    const lockedMKR = await screen.findByTestId('locked-mkr');

    expect(lockedMKR).toHaveTextContent(/^4.000000 MKR$/); //find exact match
  });

  test('can vote on an executive', async () => {
    const [voteButtonOne] = screen.getAllByTestId('vote-button-exec-overview-card');
    userEvent.click(voteButtonOne);
    const submitButton = screen.getByText('Submit Vote');
    userEvent.click(submitButton);

    // wait for transaction to progress
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
