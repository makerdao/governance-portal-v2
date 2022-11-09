import { PollInputFormat, PollResultDisplay, PollVictoryConditions } from 'modules/polling/polling.constants';
import { Poll } from 'modules/polling/types';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { gqlRequest } from '../../../../modules/gql/gqlRequest';
import { fetchPollTally } from '../fetchPollTally';
jest.mock('modules/gql/gqlRequest');

describe('Fetch tally majority', () => {
  const mockPoll: Poll = {
    pollId: 1,
    options: {
      '0': 'Abstain',
      '1': 'Approve Existing Budget',
      '2': 'Approve Increase',
      '3': 'Reject'
    },
    parameters: {
      inputFormat: {
        type: PollInputFormat.chooseFree,
        abstain: [0],
        options: []
      },
      resultDisplay: PollResultDisplay.approvalBreakdown,
      victoryConditions: [
        {
          type: PollVictoryConditions.majority,
          percent: 50
        }
      ]
    }
  } as any as Poll;

  it('Does not find winner if it doesnt pass the majority percent', async () => {
    (gqlRequest as jest.Mock).mockResolvedValueOnce({
      voteAddressMkrWeightsAtTime: {
        nodes: [
          {
            optionIdRaw: '1',
            mkrSupport: '100'
          },
          {
            optionIdRaw: '2',
            mkrSupport: '90'
          },
          {
            optionIdRaw: '3',
            mkrSupport: '80'
          }
        ]
      }
    });

    const result = await fetchPollTally(mockPoll, SupportedNetworks.MAINNET);

    const expectedResult = {
      parameters: mockPoll.parameters,
      winner: null,
      winningOptionName: 'None found',
      totalMkrParticipation: '270',
      totalMkrActiveParticipation: '270',
      numVoters: 3,
      victoryConditionMatched: null,
      results: [
        {
          optionId: 1,
          optionName: 'Approve Existing Budget',
          mkrSupport: '100',
          firstPct: 37.03703703703704,
          transferPct: 0,
          winner: false
        },
        {
          optionId: 2,
          optionName: 'Approve Increase',
          mkrSupport: '90',
          firstPct: 33.333333333333336,
          transferPct: 0,
          winner: false
        },
        {
          optionId: 3,
          optionName: 'Reject',
          firstPct: 29.62962962962963,
          mkrSupport: '80',
          transferPct: 0,
          winner: false
        },
        {
          optionId: 0,
          optionName: 'Abstain',
          mkrSupport: '0',
          firstPct: 0,
          transferPct: 0,
          winner: false
        }
      ]
    };

    expect(result).toEqual(expect.objectContaining(expectedResult));
  });

  it('Does find a winner if it pass the majority percent', async () => {
    (gqlRequest as jest.Mock).mockResolvedValueOnce({
      voteAddressMkrWeightsAtTime: {
        nodes: [
          {
            optionIdRaw: '1',
            mkrSupport: '200'
          },
          {
            optionIdRaw: '2',
            mkrSupport: '90'
          },
          {
            optionIdRaw: '3',
            mkrSupport: '80'
          }
        ]
      }
    });

    const result = await fetchPollTally(mockPoll, SupportedNetworks.MAINNET);

    const expectedResult = {
      parameters: mockPoll.parameters,
      winner: 1,
      winningOptionName: 'Approve Existing Budget',
      totalMkrParticipation: '370',
      totalMkrActiveParticipation: '370',
      numVoters: 3,
      victoryConditionMatched: 0,
      results: [
        {
          optionId: 1,
          optionName: 'Approve Existing Budget',
          mkrSupport: '200',
          firstPct: 54.054054054054056,
          transferPct: 0,
          winner: true
        },
        {
          optionId: 2,
          optionName: 'Approve Increase',
          mkrSupport: '90',
          firstPct: 24.324324324324323,
          transferPct: 0,
          winner: false
        },
        {
          optionId: 3,
          optionName: 'Reject',
          firstPct: 21.62162162162162,
          mkrSupport: '80',
          transferPct: 0,
          winner: false
        },
        {
          optionId: 0,
          optionName: 'Abstain',
          mkrSupport: '0',
          firstPct: 0,
          transferPct: 0,
          winner: false
        }
      ]
    };

    expect(result).toEqual(expect.objectContaining(expectedResult));
  });
});
