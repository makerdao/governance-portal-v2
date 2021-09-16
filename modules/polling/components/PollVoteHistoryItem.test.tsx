import { render, screen } from '@testing-library/react';
import mockVote from 'modules/polls/api/mocks/vote.json';
import { PollVoteHistoryItem } from 'modules/polls/components/PollVoteHistoryItem';
import { PollVoteHistory } from 'modules/polls/types/pollVoteHistory';
import { POLL_VOTE_TYPE } from 'modules/polls/polls.constants';

test('renders plurality vote type correctly', async () => {
  const vote = {
    ...mockVote,
    poll: {
      ...mockVote.poll,
      voteType: POLL_VOTE_TYPE.PLURALITY_VOTE
    }
  };

  render(<PollVoteHistoryItem vote={vote as PollVoteHistory} />);

  // search page for query text
  await screen.findByText(/VOTED OPTION/);

  // look for discussion link
  await screen.findByText(/Discussion/);

  // look for vote graphic text
  await screen.findAllByText(/Yes/);
  await screen.findAllByText(/No/);
  await screen.findAllByText(/Abstain/);
});

test('renders ranked choice vote type correctly', async () => {
  const vote = {
    ...mockVote,
    poll: {
      ...mockVote.poll,
      voteType: POLL_VOTE_TYPE.RANKED_VOTE
    }
  };

  render(<PollVoteHistoryItem vote={vote as PollVoteHistory} />);

  // search page for query text
  await screen.findByText(/VOTED 1ST CHOICE/);

  // check plurality graphic doesn't exist
  const abstain = screen.queryByText(/Abstain/);
  expect(abstain).not.toBeInTheDocument();
});

test('renders unknown vote type correctly', async () => {
  const vote = {
    ...mockVote,
    poll: {
      ...mockVote.poll,
      voteType: POLL_VOTE_TYPE.UNKNOWN
    }
  };

  render(<PollVoteHistoryItem vote={vote as PollVoteHistory} />);

  // unknown vote type defaults to voted option text
  await screen.findByText(/VOTED OPTION/);

  // unknown vote type doesn't show plurality graphic
  const abstain = screen.queryByText(/Abstain/);
  expect(abstain).not.toBeInTheDocument();
});
