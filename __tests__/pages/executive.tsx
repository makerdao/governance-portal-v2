import { ExecutiveOverview } from '../../pages/executive';
import proposals from '../../mocks/proposals.json';
import { injectProvider, connectAccount, renderWithAccountSelect as render } from '../helpers'; 
import { fireEvent } from '@testing-library/react';
import mixpanel from 'mixpanel-browser';
import { SWRConfig } from 'swr';

const { click } = fireEvent;
let component;

async function setup() {
  const comp = render(
  <SWRConfig value={{ dedupingInterval: 0, refreshInterval: 100 }}>
    <ExecutiveOverview proposals={proposals} />
  </SWRConfig>
  );
  await connectAccount(click, comp.findByText, comp.findByLabelText);
  return comp;
}

beforeAll(async () => {
  injectProvider();
  mixpanel.track = () => {};
  // temporary hack to hide spam errors and warnings from dependencies
  console.error = () => {};
  console.warn = () => {};
  component = await setup();
});

test('can deposit and vote', async () => {
  //deposit
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

  //vote
  const [voteButtonOne, ] = await component.findAllByTestId('vote-button-exec-overview-card');
  click(voteButtonOne);
  const submitButton = await component.findByText('Submit Vote');
  click(submitButton);
  //TODO: get the UI to reflect the vote and test for that
}, 10000);