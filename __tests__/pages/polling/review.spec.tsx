import { act, screen } from '@testing-library/react';
import getMaker from '../../../lib/maker';
import { accountsApi } from '../../../modules/app/stores/accounts';
import { ballotApi } from '../../../modules/polling/stores/ballotStore';
import PollingReviewPage from '../../../pages/polling/review';
import {
  connectAccount,
  createTestPolls,
  renderWithAccountSelect as render,
  DEMO_ACCOUNT_TESTS
} from '../../helpers';
import { formatAddress } from 'lib/utils';
import mockPolls from 'modules/polling/api/mocks/polls.json';
import mockBallot from 'modules/polling/api/mocks/ballot.json';

let maker;

describe('/polling page', () => {
  beforeAll(async () => {
    maker = await getMaker();
    accountsApi.getState().addAccountsListener(maker);
    await createTestPolls(maker);
  });

  beforeEach(async () => {
    accountsApi.setState({ currentAccount: undefined });
    render(<PollingReviewPage polls={mockPolls as Poll[]} />);
    await act(async () => {
      await connectAccount();
    });
  });

  describe('/polling/review page', () => {
    test('renders page without connected account', async () => {
      act(() => {
        accountsApi.setState({ currentAccount: undefined });
      });
      const reviewHeader = screen.getByText('Review & Submit Ballot');
      const noWalletText = screen.getByText('Connect a wallet to vote');
      expect(reviewHeader).toBeInTheDocument();
      expect(noWalletText).toBeInTheDocument();
    });

    test('renders page with connected account but empty ballot', async () => {
      const address = screen.getByText(formatAddress(DEMO_ACCOUNT_TESTS));
      const reviewHeader = screen.getByText('Review & Submit Ballot');
      const emptyBallotText = screen.getByText('Your ballot is empty');
      expect(address).toBeInTheDocument();
      expect(reviewHeader).toBeInTheDocument();
      expect(emptyBallotText).toBeInTheDocument();
    });

    test('renders page with polls in ballot state', async () => {
      act(() => {
        ballotApi.setState({ ballot: mockBallot });
      });
      const pollOverviewCards = screen.getAllByTestId('poll-overview');
      const submitBallotText = screen.getAllByText(/Submit Your Ballot/i);
      expect(pollOverviewCards).toHaveLength(2);
      expect(submitBallotText.length).toBeGreaterThanOrEqual(1);
    });
  });
});
