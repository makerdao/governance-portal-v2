import { render, screen } from '@testing-library/react';
import VotesByAddress from 'modules/polling/components/VotesByAddress';
import mockPolls from 'modules/polling/api/mocks/polls.json';
import mockTally from 'modules/polling/api/mocks/tally.json';
import { POLL_VOTE_TYPE } from 'modules/polling/polling.constants';
import { Poll, PollTally } from 'modules/polling/types';
import { useDelegateAddressMap } from 'modules/delegates/hooks/useDelegateAddressMap';

jest.mock('modules/delegates/hooks/useDelegateAddressMap');

const mockPoll = {
  ...mockPolls[0],
  endDate: new Date(mockPolls[0].endDate),
  startDate: new Date(mockPolls[0].startDate),
  voteType: POLL_VOTE_TYPE.PLURALITY_VOTE,
  options: {
    0: 'Abstain',
    1: 'Yes',
    2: 'No'
  }
};

const mockedTally: PollTally = {
  ...mockTally,
  pollVoteType: POLL_VOTE_TYPE.PLURALITY_VOTE
};

const props: { tally: PollTally; poll: Poll } = {
  tally: mockedTally,
  poll: mockPoll
};

describe('Polling votes by address', () => {
  beforeAll(() => {
    (useDelegateAddressMap as jest.Mock).mockReturnValue({
      data: []
    });
  });

  test('renders plurality vote type correctly', async () => {
    render(<VotesByAddress {...props} />);
    // look for columns
    await screen.findByText(/Address/);
    await screen.findByText(/Option/);
    await screen.findByText(/Voting Power/);
    await screen.findByText(/MKR Amount/);

    // look for yes votes
    await screen.findAllByText(/Yes/);
  });

  test('renders ranked choice vote type correctly', async () => {
    const updatedTally = {
      ...mockedTally,
      votesByAddress: [
        {
          voter: '0xad2fda5f6ce305d2ced380fdfa791b6a26e7f281',
          optionId: 1,
          optionIdRaw: '1',
          mkrSupport: 28312.074392254362747305,
          rankedChoiceOption: [0, 1, 2]
        }
      ]
    };

    const updatedProps = {
      ...props,
      poll: {
        ...props.poll,
        voteType: POLL_VOTE_TYPE.RANKED_VOTE,
        options: {
          0: 'test1',
          1: 'test2',
          2: 'test3'
        }
      },
      tally: updatedTally
    };

    render(<VotesByAddress {...updatedProps} />);

    // look for columns
    await screen.findByText(/Address/);
    await screen.findByText(/Option/);
    await screen.findByText(/Voting Power/);
    await screen.findByText(/MKR Amount/);

    // check first choice is displayed with asterisk
    //await screen.findByText(/test1*/);

    // check explainer text exists
    //await screen.findByText('*First choice in ranked choice vote shown');
  });

  test('renders unknown vote type correctly', async () => {
    const updatedProps = {
      ...props,
      poll: {
        ...props.poll,
        voteType: POLL_VOTE_TYPE.UNKNOWN
      }
    };

    render(<VotesByAddress {...updatedProps} />);

    // look for columns
    await screen.findByText(/Address/);
    await screen.findByText(/Option/);
    await screen.findByText(/Voting Power/);
    await screen.findByText(/MKR Amount/);

    // look for yes votes despite unknown poll type
    await screen.findAllByText(/Yes/);
  });
});
