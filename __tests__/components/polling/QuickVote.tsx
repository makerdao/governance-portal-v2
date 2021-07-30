import { act, screen } from '@testing-library/react';
import mockPolls from '../../../mocks/polls.json';
import { accountsApi } from '../../../stores/accounts';
import { connectAccount, createTestPolls, renderWithAccountSelect as render } from '../../helpers';
import getMaker from '../../../lib/maker';
import PollingOverviewPage from '../../../pages/polling';

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
    const view = render(<PollingOverviewPage polls={mockPolls as any} />);

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
