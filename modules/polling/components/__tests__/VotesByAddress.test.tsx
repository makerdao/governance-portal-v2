/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import VotesByAddress from 'modules/polling/components/VotesByAddress';
import mockPolls from 'modules/polling/api/mocks/polls.json';
import mockTally from 'modules/polling/api/mocks/tally.json';
import { PollInputFormat, PollResultDisplay, PollVictoryConditions } from 'modules/polling/polling.constants';
import { Poll, PollTally } from 'modules/polling/types';
import { useDelegateAddressMap } from 'modules/delegates/hooks/useDelegateAddressMap';
import { useBreakpointIndex } from '@theme-ui/match-media';

jest.mock('@theme-ui/match-media');
jest.mock('modules/delegates/hooks/useDelegateAddressMap');
jest.mock('modules/web3/connections', () => ({ connectorToWalletName: () => null }));

const mockPoll: Poll = {
  ...mockPolls[0],
  endDate: new Date(mockPolls[0].endDate),
  startDate: new Date(mockPolls[0].startDate),
  parameters: {
    inputFormat: {
      type: PollInputFormat.singleChoice,
      abstain: [0],
      options: []
    },
    resultDisplay: PollResultDisplay.singleVoteBreakdown,
    victoryConditions: [{ type: PollVictoryConditions.plurality }]
  },
  options: {
    0: 'Abstain',
    1: 'Yes',
    2: 'No'
  }
};

const mockedTally: PollTally = {
  ...mockTally
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
    (useBreakpointIndex as jest.Mock).mockReturnValue(4);
  });

  test('renders plurality vote type correctly', async () => {
    render(<VotesByAddress {...props} />);
    // look for columns
    await screen.findByText(/Address/);
    await screen.findByText(/Option/);
    await screen.findByText(/Vote %/);
    expect(screen.getByTestId('mkr-header')).toBeVisible();
    // look for yes votes
    await screen.findAllByText(/Yes/);
  });

  test('renders ranked choice vote type correctly', async () => {
    const updatedTally: PollTally = {
      ...mockedTally,
      votesByAddress: [
        {
          voter: '0xad2fda5f6ce305d2ced380fdfa791b6a26e7f281',
          ballot: [0, 1, 2],
          mkrSupport: 28312.074392254362747305,
          chainId: 1,
          hash: '0x021',
          blockTimestamp: 1,
          optionIdRaw: '012',
          pollId: 1
        }
      ]
    };

    const updatedProps = {
      ...props,
      poll: {
        ...props.poll,
        parameters: {
          inputFormat: {
            type: PollInputFormat.rankFree,
            abstain: [0],
            options: []
          },
          resultDisplay: PollResultDisplay.instantRunoffBreakdown,
          victoryConditions: [{ type: PollVictoryConditions.instantRunoff }]
        },
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
    await screen.findByText(/Vote %/);

    expect(screen.getByTestId('mkr-header')).toBeVisible();

    // check first choice is displayed with number
    await screen.findByText(/1st - test1/);
    await screen.findByText(/2nd - test2/);
    await screen.findByText(/3rd - test3/);
  });
});
