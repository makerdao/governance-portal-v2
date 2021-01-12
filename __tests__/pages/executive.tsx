import { ExecutiveOverview } from '../../pages/executive';
import proposals from '../../mocks/proposals.json';
import { injectProvider, connectAccount, renderWithAccountSelect as render } from '../helpers'; 
import { fireEvent } from '@testing-library/react';
import mixpanel from 'mixpanel-browser';
import { SWRConfig } from 'swr';
import { accountsApi } from '../../stores/accounts';
import { configure } from '@testing-library/react'

const { click } = fireEvent;
let component;

async function setup() {
  const comp = render(
  <SWRConfig value={{ dedupingInterval: 0, refreshInterval: 10 }}>
    <ExecutiveOverview proposals={proposals} />
  </SWRConfig>
  );
  await connectAccount(click, comp.findByText, comp.findByLabelText);
  return comp;
}

beforeAll(async () => {
  configure({ asyncUtilTimeout: 4500 });
  injectProvider();
  mixpanel.track = () => {};
  // temporary hack to hide spam errors and warnings from dependencies
  console.error = () => {};
  console.warn = () => {};
});

beforeEach(async () => {
  component = await setup();
});

afterEach(async () => {
  accountsApi.getState().disconnectAccount();
});

test('can deposit and withdraw', async () => {
  const depositButton = await component.findByTestId('deposit-button');
  click(depositButton);
  await component.findByText('Approve voting contract');
  const approveButton = component.getByTestId('deposit-approve-button');
  click(approveButton);
  await component.findByText('Deposit into voting contract');
  const input = component.getByLabelText('mkr-input');
  fireEvent.change(input, { target: { value: '10' } });
  const finalDepositButton = await component.findByText('Deposit MKR');
  expect(finalDepositButton.disabled).toBe(false);
  click(finalDepositButton);

  const withdrawButton = await component.findByTestId('withdraw-button');
  click(withdrawButton);
  await component.findByText('Approve voting contract');
  const approveButtonWithdraw = component.getByTestId('withdraw-approve-button');
  click(approveButtonWithdraw);
  await component.findByText('Withdraw from voting contract');
  const inputWithdraw = component.getByLabelText('mkr-input');
  fireEvent.change(inputWithdraw, { target: { value: '10' } });
  const finalDepositButtonWithdraw = await component.findByText('Withdraw MKR');
  expect(finalDepositButtonWithdraw.disabled).toBe(false);
  click(finalDepositButtonWithdraw);
}, 15000);

test('can vote', async () => {
  const [voteButtonOne, ] = await component.findAllByTestId('vote-button-exec-overview-card');
  click(voteButtonOne);
  const submitButton = await component.findByText('Submit Vote');
  click(submitButton);
  //TODO: get the UI to reflect the vote and test for that
});