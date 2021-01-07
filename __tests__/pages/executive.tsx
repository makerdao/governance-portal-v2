import { ExecutiveOverview } from '../../pages/executive';
import proposals from '../../mocks/proposals.json';
import { injectProvider, connectAccount, renderWithAccountSelect as render } from '../helpers'; 
import { fireEvent, cleanup } from '@testing-library/react';
import mixpanel from 'mixpanel-browser';
import { cache } from 'swr';

const { click } = fireEvent;
let component;

async function setup() {
  const comp = render(<ExecutiveOverview proposals={proposals} />);
  await connectAccount(click, comp.findByText, comp.findByLabelText);
  return comp;
}

beforeAll(async () => {
  injectProvider();
  mixpanel.track = () => {};
  // temporary hack to hide spam errors and warnings from dependencies
  console.error = () => {};
  console.warn = () => {};
});

beforeEach(async () => {
  component = await setup();
});

test('can deposit', async () => {
  const depositButton = await component.findByTestId('deposit-button');
  click(depositButton);
  const t = await component.findByText('Approve voting contract');
  const approveButton = component.getByTestId('deposit-approve-button');
  click(approveButton);
  //TODO
});

test('can vote', async () => {
  const [voteButtonOne, ] = await component.findAllByTestId('vote-button-exec-overview-card');
  click(voteButtonOne);
  const submitButton = await component.findByText('Submit Vote');
  click(submitButton);
  //FIXME: test that UI updates accordingly, for some reason the votedProposals isn't being updated even though the tx succeeds
});