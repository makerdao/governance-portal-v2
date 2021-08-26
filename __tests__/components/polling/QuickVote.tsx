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

describe('QuickVote', () => {
  beforeAll(async () => {
    maker = await getMaker();
    accountsApi.getState().addAccountsListener();
    await createTestPolls(maker);
    jest.setTimeout(30000);
  });

  beforeEach(async () => {
    accountsApi.setState({ currentAccount: undefined });
    render(<PollingOverviewPage categories={mockCategories as PollCategory[]} polls={mockPolls as Poll[]} />);

    await act(async () => {
      await connectAccount();
    });
  });

  test('renders QuickVote component', async () => {
    expect(await screen.findByText('Your Ballot')).toBeInTheDocument();
    expect((await screen.findAllByText('View Details')).length).toBe(2);
    expect((await screen.findAllByText('Add vote to ballot')).length).toBe(2);
    expect((await screen.findAllByTestId('countdown timer')).length).toBe(2);
    screen.getByText('Active Polls');
    screen.getByText(/MIP14:/i);
  });
});
