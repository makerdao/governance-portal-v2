import { act, screen } from '@testing-library/react';
import mockPolls from 'modules/polls/api/mocks/polls.json';
import mockCategories from '../../../mocks/categories.json';
import { accountsApi } from '../../../stores/accounts';
import { connectAccount, createTestPolls, renderWithAccountSelect as render } from '../../helpers';
import getMaker from '../../../lib/maker';
import PollingOverviewPage from '../../../pages/polling';
import { Poll, PollCategory } from 'modules/polls/types';


let maker;

jest.mock('@theme-ui/match-media', () => {
  return {
    useBreakpointIndex: jest.fn(() => 3)
  };
});

beforeAll(async () => {
  maker = await getMaker();
  await createTestPolls(maker);
});

beforeEach(async () => {
  accountsApi.setState({ currentAccount: undefined });
  render(<PollingOverviewPage categories={mockCategories as PollCategory[]} polls={mockPolls as Poll[]} />);
  await act(async () => {
    await connectAccount();
  });
});

test('single select options render properly', async () => {
  const select = await screen.findByTestId('single select');
  const options = await screen.findAllByTestId('single select option');

  expect(select).toBeInTheDocument();
  expect(options.length).toBe(2);
  expect(await screen.findByText('Yes')).toBeInTheDocument();
  expect(await screen.findByText('No')).toBeInTheDocument();
});
