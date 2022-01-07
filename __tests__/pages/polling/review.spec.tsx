import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
      expect(submitBallotText[0]).toBeInTheDocument();
    });

    test('can submit ballot', async () => {
      act(() => {
        ballotApi.setState({ ballot: mockBallot });
      });
      const pollOverviewCards = screen.getAllByTestId('poll-overview');
      const submitBallotText = screen.getAllByText(/Submit Your Ballot/i);
      expect(pollOverviewCards).toHaveLength(2);
      act(() => {
        userEvent.click(submitBallotText[0]);
      });
      await screen.findByText('Transaction Sent!');
      await screen.findByText('Votes will update once the transaction is confirmed.');
    });

    test('can comment on poll vote', async () => {
      act(() => {
        ballotApi.setState({ ballot: mockBallot });
      });
      const pollOverviewCards = screen.getAllByTestId('poll-overview');
      expect(pollOverviewCards).toHaveLength(2);

      // sign comments button only appears after typing in comment input
      expect(screen.queryByText(/Sign Your Comments/i)).not.toBeInTheDocument();

      const commentInputs = screen.getAllByRole('textbox');
      expect(commentInputs.length).toBe(2);

      userEvent.type(commentInputs[0], 'can devs do something?');
      const signCommentButtons = screen.queryAllByText(/Sign Your Comments/i);
      expect(signCommentButtons[0]).toBeInTheDocument();

      userEvent.click(signCommentButtons[0]);

      // TODO: figure out how to sign message pop up
      // const signedCheckmark = await screen.findByTestId('checkmark');
      // expect(signedCheckmark).toBeInTheDocument();
    });

    test('can edit ballot choices', async () => {
      act(() => {
        ballotApi.setState({ ballot: mockBallot });
      });
      const pollOverviewCards = screen.getAllByTestId('poll-overview');
      expect(pollOverviewCards).toHaveLength(2);

      const editButtons = screen.getAllByText(/Edit Choice/i);
      expect(editButtons.length).toBe(2);

      const choiceSummary = await screen.findAllByTestId('choice');
      expect(choiceSummary[0]).toHaveTextContent('Abstain');

      userEvent.click(editButtons[0]);

      const updateButton = screen.getByText(/Update vote/i);
      expect(updateButton).toBeInTheDocument();
      expect(updateButton).toBeDisabled();

      const choiceDropdown = screen.getAllByText(/Your choice/i);
      userEvent.click(choiceDropdown[0]);

      const options = screen.getAllByTestId('single-select-option');
      userEvent.click(options[1]);
      expect(updateButton).toBeEnabled();
      userEvent.click(updateButton);
      expect(updateButton).not.toBeInTheDocument();
      expect(editButtons.length).toBe(2);

      const choiceSummaryNew = await screen.findAllByTestId('choice');
      expect(choiceSummaryNew[0]).toHaveTextContent('Yes');
    });
  });
});
