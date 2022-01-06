import { act, screen } from '@testing-library/react';
import {
  connectAccount,
  createTestPolls,
  renderWithAccountSelect as render,
  DEMO_ACCOUNT_TESTS
} from '../helpers';
import { formatAddress } from 'lib/utils';
import PollingOverviewPage from '../../pages/polling';
import getMaker from '../../lib/maker';
import mockPolls from 'modules/polling/api/mocks/polls.json';
import mockCategories from '../../modules/polling/components/__mocks__/categories.json';
import { accountsApi } from '../../modules/app/stores/accounts';
import { Poll, PollCategory } from 'modules/polling/types';

let maker;

jest.mock('@theme-ui/match-media', () => {
  return {
    useBreakpointIndex: jest.fn(() => 3)
  };
});

describe('/polling page', () => {
  beforeAll(async () => {
    jest.setTimeout(30000);
    maker = await getMaker();
    accountsApi.getState().addAccountsListener(maker);
    await createTestPolls(maker);
  });

  beforeEach(async () => {
    accountsApi.setState({ currentAccount: undefined });
    render(<PollingOverviewPage categories={mockCategories as PollCategory[]} polls={mockPolls as Poll[]} />);
    await act(async () => {
      await connectAccount();
    });
  });

  describe('renders polls', () => {
    test('renders active polls', async () => {
      const activePollsText = screen.queryAllByText('Active Polls');
      expect(activePollsText.length).toBe(2);
      expect(activePollsText[0]).toBeInTheDocument();
      expect(activePollsText[1]).toBeInTheDocument();
    });

    test('shows ballot when account is connected', async () => {
      const address = screen.queryByText(formatAddress(DEMO_ACCOUNT_TESTS));
      expect(address).toBeInTheDocument();
      const ballot = screen.queryByText('Your Ballot');
      expect(ballot).toBeInTheDocument();
    });

    test('does not show ballot when no account connected', async () => {
      // remove account from state
      act(() => {
        accountsApi.setState({ currentAccount: undefined });
      });
      const address = screen.queryByText(formatAddress(DEMO_ACCOUNT_TESTS));
      expect(address).not.toBeInTheDocument();
      const ballot = screen.queryByText('Your Ballot');
      expect(ballot).not.toBeInTheDocument();
    });
  });
});
