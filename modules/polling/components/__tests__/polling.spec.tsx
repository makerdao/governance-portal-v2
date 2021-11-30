import { act, screen } from '@testing-library/react';
import {
  connectAccount,
  createTestPolls,
  renderWithAccountSelect as render,
  DEMO_ACCOUNT_TESTS
} from '../../../../__tests__/helpers';
import { formatAddress } from 'lib/utils';
import PollingOverviewPage from '../../../../pages/polling';
import getMaker from '../../../../lib/maker';
import mockPolls from 'modules/polling/api/mocks/polls.json';
import mockCategories from '../__mocks__/categories.json';
import { accountsApi } from '../../../../stores/accounts';
import { Poll, PollCategory } from 'modules/polling/types';

let maker;

jest.mock('@theme-ui/match-media', () => {
  return {
    useBreakpointIndex: jest.fn(() => 3)
  };
});

describe('Polling', () => {
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

  describe('renders expected voting options for each poll type', () => {
    test('allows users to vote when account is connected', async () => {
      // Find a heading and checkbox with the text.
      const activePollsText = await screen.findAllByText('Active Polls', {}, { timeout: 15000 });

      expect(activePollsText.length).toBe(2);
      expect(activePollsText[0]).toBeInTheDocument();
      expect(activePollsText[1]).toBeInTheDocument();
      expect(await screen.findByText('Your Ballot', {}, { timeout: 15000 })).toBeInTheDocument();
      await screen.findByText(formatAddress(DEMO_ACCOUNT_TESTS));
    });
  });
});
