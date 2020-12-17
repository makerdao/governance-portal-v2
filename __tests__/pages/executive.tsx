import { ExecutiveOverview } from '../../pages/executive';
import proposals from '../../mocks/proposals.json';
import { injectProvider, connectAccount, renderWithAccountSelect as render } from '../helpers'; 
import { fireEvent } from '@testing-library/react';

const { click } = fireEvent;
let component;

async function setup() {
  const comp = render(<ExecutiveOverview proposals={proposals} />);
  await connectAccount(click, comp.findByText, comp.findByLabelText);
  return comp;
}

beforeAll(async () => {
  injectProvider();
  // temporary hack to hide spam errors and warnings from dependencies
  console.error = () => {};
  console.warn = () => {};
});

beforeEach(async () => {
  component = await setup();
});

test('basic rendering', async () => {
  component.getByText('Raise the Test Coverage');
});

test('can vote', async () => {
  const voteButton = await component.findByTestId('vote-button-exec-overview-card');
  expect(voteButton).toBeDefined();
  click(voteButton);
  expect(await component.findByText('Confirm Vote')).toBeDefined();
});