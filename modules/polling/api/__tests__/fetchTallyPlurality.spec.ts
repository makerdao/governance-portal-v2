import { PollInputFormat, PollResultDisplay, PollVictoryConditions } from 'modules/polling/polling.constants';
import { Poll } from 'modules/polling/types';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { gqlRequest } from '../../../../modules/gql/gqlRequest';
import { fetchPollTally } from '../fetchPollTally';
jest.mock('modules/gql/gqlRequest');

describe('Fetch tally plurality', () => {
  const mockPoll: Poll = {
    pollId: 1,
    options: {
      '0': 'Abstain',
      '1': 'First',
      '2': 'Second',
      '3': 'Third',
      '4': 'Fourth'
    },
    parameters: {
      inputFormat: {
        type: PollInputFormat.singleChoice,
        abstain: [0],
        options: []
      },
      resultDisplay: PollResultDisplay.singleVoteBreakdown,
      victoryConditions: [
        {
          type: PollVictoryConditions.plurality
        }
      ]
    }
  } as any as Poll;

  it('gives expected results', async () => {
    (gqlRequest as jest.Mock).mockResolvedValueOnce({
      voteAddressMkrWeightsAtTime: {
        nodes: [
          {
            optionIdRaw: '1',
            mkrSupport: '40'
          },
          {
            optionIdRaw: '1',
            mkrSupport: '60'
          },
          {
            optionIdRaw: '0',
            mkrSupport: '77'
          },
          {
            optionIdRaw: '0',
            mkrSupport: '32'
          },
          {
            optionIdRaw: '1',
            mkrSupport: '600'
          }
        ]
      }
    });

    const result = await fetchPollTally(mockPoll, SupportedNetworks.MAINNET);

    const expectedResult = {
      parameters: mockPoll.parameters,
      winner: 1,
      winningOptionName: 'First',
      totalMkrParticipation: '809',
      victoryConditionMatched: 0,
      totalMkrActiveParticipation: '700',
      numVoters: 5,
      results: [
        {
          optionId: 1,
          optionName: 'First',
          mkrSupport: '700',
          firstPct: 86.52657601977751,
          transferPct: 0,
          winner: true
        },
        {
          optionId: 0,
          optionName: 'Abstain',
          mkrSupport: '109',
          firstPct: 13.473423980222497,
          transferPct: 0,
          winner: false
        },
        {
          optionId: 4,
          optionName: 'Fourth',
          firstPct: 0,
          mkrSupport: '0',
          transferPct: 0,
          winner: false
        },
        {
          optionId: 2,
          optionName: 'Second',
          mkrSupport: '0',
          firstPct: 0,
          transferPct: 0,
          winner: false
        },
        {
          optionId: 3,
          optionName: 'Third',
          firstPct: 0,
          mkrSupport: '0',
          transferPct: 0,
          winner: false
        }
      ]
    };

    expect(result).toEqual(expect.objectContaining(expectedResult));
  });

  it('gives expected results for adjusted data', async () => {
    (gqlRequest as jest.Mock).mockResolvedValueOnce({
      voteAddressMkrWeightsAtTime: {
        nodes: [
          {
            optionIdRaw: '1',
            mkrSupport: '40'
          },
          {
            optionIdRaw: '1',
            mkrSupport: '60'
          },
          {
            optionIdRaw: '0',
            mkrSupport: '77'
          },
          {
            optionIdRaw: '0',
            mkrSupport: '32'
          },
          {
            optionIdRaw: '1',
            mkrSupport: '600'
          },
          {
            optionIdRaw: '2',
            mkrSupport: '32'
          },
          {
            optionIdRaw: '2',
            mkrSupport: '1200'
          }
        ]
      }
    });

    const result = await fetchPollTally(mockPoll, SupportedNetworks.MAINNET);

    const expectedResult = {
      parameters: mockPoll.parameters,
      winner: 2,
      winningOptionName: 'Second',
      totalMkrParticipation: '2041',
      victoryConditionMatched: 0,
      totalMkrActiveParticipation: '1932',
      numVoters: 7,
      results: [
        {
          optionId: 2,
          optionName: 'Second',
          mkrSupport: '1232',
          firstPct: 60.362567368936794,
          transferPct: 0,
          winner: true
        },
        {
          optionId: 1,
          optionName: 'First',
          mkrSupport: '700',
          firstPct: 34.296913277805,
          transferPct: 0,
          winner: false
        },
        {
          optionId: 0,
          optionName: 'Abstain',
          mkrSupport: '109',
          firstPct: 5.340519353258207,
          transferPct: 0,
          winner: false
        },
        {
          optionId: 4,
          optionName: 'Fourth',
          firstPct: 0,
          mkrSupport: '0',
          transferPct: 0,
          winner: false
        },
        {
          optionId: 3,
          optionName: 'Third',
          firstPct: 0,
          mkrSupport: '0',
          transferPct: 0,
          winner: false
        }
      ]
    };

    expect(result).toEqual(expect.objectContaining(expectedResult));
  });

  it('parses correctly a plurality with no votes', async () => {
    (gqlRequest as jest.Mock).mockResolvedValueOnce({
      voteAddressMkrWeightsAtTime: {
        nodes: []
      }
    });

    const result = await fetchPollTally(mockPoll, SupportedNetworks.MAINNET);

    const expectedResult = {
      parameters: mockPoll.parameters,
      winner: null,
      winningOptionName: 'None found',
      totalMkrParticipation: '0',
      victoryConditionMatched: null,
      totalMkrActiveParticipation: '0',
      numVoters: 0,
      results: [
        {
          optionId: 0,
          optionName: 'Abstain',
          mkrSupport: '0',
          firstPct: 0,
          transferPct: 0,
          winner: false
        },
        {
          optionId: 1,
          optionName: 'First',
          mkrSupport: '0',
          firstPct: 0,
          transferPct: 0,
          winner: false
        },
        {
          optionId: 4,
          optionName: 'Fourth',
          firstPct: 0,
          mkrSupport: '0',
          transferPct: 0,
          winner: false
        },
        {
          optionId: 2,
          optionName: 'Second',
          mkrSupport: '0',
          firstPct: 0,
          transferPct: 0,
          winner: false
        },

        {
          optionId: 3,
          optionName: 'Third',
          firstPct: 0,
          mkrSupport: '0',
          transferPct: 0,
          winner: false
        }
      ]
    };

    expect(result).toEqual(expect.objectContaining(expectedResult));
  });

  it('gives expected results for tally with abstain majority', async () => {
    (gqlRequest as jest.Mock).mockResolvedValueOnce({
      voteAddressMkrWeightsAtTime: {
        nodes: [
          {
            optionIdRaw: '1',
            mkrSupport: '40'
          },
          {
            optionIdRaw: '1',
            mkrSupport: '60'
          },
          {
            optionIdRaw: '0',
            mkrSupport: '77'
          },
          {
            optionIdRaw: '0',
            mkrSupport: '32'
          },
          {
            optionIdRaw: '1',
            mkrSupport: '600'
          },
          {
            optionIdRaw: '2',
            mkrSupport: '32'
          },
          {
            optionIdRaw: '0',
            mkrSupport: '1200'
          }
        ]
      }
    });

    const result = await fetchPollTally(mockPoll, SupportedNetworks.MAINNET);

    const expectedResult = {
      parameters: mockPoll.parameters,
      winner: 1,
      winningOptionName: 'First',
      totalMkrParticipation: '2041',
      victoryConditionMatched: 0,
      totalMkrActiveParticipation: '732',
      numVoters: 7,
      results: [
        {
          optionId: 0,
          optionName: 'Abstain',
          mkrSupport: '1309',
          firstPct: 64.13522782949535,
          transferPct: 0,
          winner: false
        },
        {
          optionId: 1,
          optionName: 'First',
          mkrSupport: '700',
          firstPct: 34.296913277805,
          transferPct: 0,
          winner: true
        },
        {
          optionId: 2,
          optionName: 'Second',
          mkrSupport: '32',
          firstPct: 1.567858892699657,
          transferPct: 0,
          winner: false
        },
        {
          optionId: 4,
          optionName: 'Fourth',
          firstPct: 0,
          mkrSupport: '0',
          transferPct: 0,
          winner: false
        },
        {
          optionId: 3,
          optionName: 'Third',
          firstPct: 0,
          mkrSupport: '0',
          transferPct: 0,
          winner: false
        }
      ]
    };

    expect(result).toEqual(expect.objectContaining(expectedResult));
  });
});
