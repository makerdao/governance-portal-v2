import { gqlRequest } from '../../../../modules/gql/gqlRequest';
import { fetchPollTally } from '../fetchPollTally';
import BigNumber from 'lib/bigNumberJs';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { Poll } from 'modules/polling/types';
import { PollInputFormat, PollResultDisplay, PollVictoryConditions } from 'modules/polling/polling.constants';
jest.mock('modules/gql/gqlRequest');

const fromBuffer = (buf, opts?) => {
  if (!opts) {
    opts = {};
  }

  const endian = { 1: 'big', '-1': 'little' }[opts.endian] || opts.endian || 'big';

  const size = opts.size === 'auto' ? Math.ceil(buf.length) : opts.size || 1;

  if (buf.length % size !== 0) {
    throw new RangeError(`Buffer length (${buf.length}) must be a multiple of size (${size})`);
  }

  const hex = [];
  for (let i = 0; i < buf.length; i += size) {
    const chunk = [];
    for (let j = 0; j < size; j++) {
      chunk.push(buf[i + (endian === 'big' ? j : size - j - 1)]);
    }

    hex.push(chunk.map(c => (c < 16 ? '0' : '') + c.toString(16)).join(''));
  }

  return new BigNumber(hex.join(''), 16);
};

describe('Fetch tally ranked', () => {
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
        type: PollInputFormat.rankFree,
        abstain: [0],
        options: []
      },
      resultDisplay: PollResultDisplay.instantRunoffBreakdown,
      victoryConditions: [
        {
          type: PollVictoryConditions.instantRunoff
        }
      ]
    }
  } as any as Poll;

  it('gives expected results for a tally with majority', async () => {
    (gqlRequest as jest.Mock).mockResolvedValueOnce({
      voteAddressMkrWeightsAtTime: {
        nodes: [
          {
            mkrSupport: '60.025000000000000000',
            optionIdRaw: fromBuffer([1, 3].reverse()) // [1st choice, 2nd choice, ...]
          },
          {
            mkrSupport: '200.598801867883985831',
            optionIdRaw: fromBuffer([3, 1].reverse())
          },
          {
            mkrSupport: '64.068823529411764706',
            optionIdRaw: fromBuffer([2, 3].reverse())
          }
        ]
      }
    });

    const result = await fetchPollTally(mockPoll, SupportedNetworks.MAINNET);
    const expectedResult = {
      parameters: mockPoll.parameters,
      rounds: 1,
      winner: 3,
      winningOptionName: 'Third',
      victoryConditionMatched: 0,
      totalMkrParticipation: '324.692625397295750537',
      totalMkrActiveParticipation: '324.692625397295750537',
      results: [
        {
          optionId: 3,
          optionName: 'Third',
          mkrSupport: '200.598801867883985831',
          firstPct: 61.78113889172264,
          transfer: '0',
          transferPct: 0,
          winner: true,
          eliminated: false
        },
        {
          optionId: 2,
          optionName: 'Second',
          mkrSupport: '64.068823529411764706',
          firstPct: 19.732146195503145,
          transfer: '0',
          transferPct: 0,
          winner: false,
          eliminated: false
        },
        {
          optionId: 1,
          optionName: 'First',
          firstPct: 18.486714912774218,
          mkrSupport: '60.025',
          transfer: '0',
          transferPct: 0,
          winner: false,
          eliminated: false
        },
        {
          optionId: 0,
          optionName: 'Abstain',
          firstPct: 0,
          mkrSupport: '0',
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
        }
      ],
      numVoters: 3
    };

    expect(result).toEqual(expect.objectContaining(expectedResult));
  });
  it('gives expected results for a tally with no  majority', async () => {
    (gqlRequest as jest.Mock).mockResolvedValueOnce({
      voteAddressMkrWeightsAtTime: {
        nodes: [
          {
            mkrSupport: '60.025000000000000000',
            optionIdRaw: fromBuffer([1, 3].reverse()) // [1st choice, 2nd choice, ...]
          },
          {
            mkrSupport: '102.598801867883985831',
            optionIdRaw: fromBuffer([3, 1].reverse())
          },
          {
            mkrSupport: '64.068823529411764706',
            optionIdRaw: fromBuffer([2, 3].reverse())
          }
        ]
      }
    });

    const result = await fetchPollTally(mockPoll, SupportedNetworks.MAINNET);

    const expectedResult = {
      parameters: mockPoll.parameters,
      rounds: 2,
      winner: 3,
      winningOptionName: 'Third',
      victoryConditionMatched: 0,
      totalMkrParticipation: '226.692625397295750537',
      totalMkrActiveParticipation: '226.692625397295750537',
      results: [
        {
          optionId: 3,
          optionName: 'Third',
          mkrSupport: '102.598801867883985831',
          firstPct: 45.25899406214557,
          transfer: '60.025',
          transferPct: 26.47858521855385,
          winner: true,
          eliminated: false
        },
        {
          optionId: 2,
          optionName: 'Second',
          mkrSupport: '64.068823529411764706',
          firstPct: 28.262420719300582,
          transfer: '0',
          transferPct: 0,
          winner: false,
          eliminated: false
        },
        {
          optionId: 0,
          optionName: 'Abstain',
          firstPct: 0,
          mkrSupport: '0',
          transferPct: 0,
          winner: false
        },
        {
          optionId: 1,
          optionName: 'First',
          firstPct: 26.47858521855385,
          mkrSupport: '60.025',
          transfer: '-60.025',
          transferPct: -26.47858521855385,
          winner: false,
          eliminated: true
        },

        {
          optionId: 4,
          optionName: 'Fourth',
          firstPct: 0,
          mkrSupport: '0',
          transferPct: 0,
          winner: false
        }
      ],
      numVoters: 3
    };

    expect(result).toEqual(expect.objectContaining(expectedResult));
  });

  it('gives expected results for a tally with multiple rounds', async () => {
    (gqlRequest as jest.Mock).mockResolvedValueOnce({
      voteAddressMkrWeightsAtTime: {
        nodes: [
          {
            mkrSupport: '60.025000000000000000',
            optionIdRaw: fromBuffer([1, 3].reverse()) // [1st choice, 2nd choice, ...]
          },
          {
            mkrSupport: '102.598801867883985831',
            optionIdRaw: fromBuffer([3, 1].reverse())
          },
          {
            mkrSupport: '64.068823529411764706',
            optionIdRaw: fromBuffer([2, 3].reverse())
          },
          {
            mkrSupport: '4',
            optionIdRaw: fromBuffer([4, 1].reverse())
          }
        ]
      }
    });

    const result = await fetchPollTally(mockPoll, SupportedNetworks.MAINNET);

    const expectedResult = {
      parameters: mockPoll.parameters,
      rounds: 3,
      winner: 3,
      winningOptionName: 'Third',
      victoryConditionMatched: 0,
      totalMkrParticipation: '230.692625397295750537',
      totalMkrActiveParticipation: '230.692625397295750537',
      results: [
        {
          optionId: 3,
          optionName: 'Third',
          mkrSupport: '102.598801867883985831',
          firstPct: 44.474244328872544,
          transfer: '60.025',
          transferPct: 26.019470668655206,
          winner: true,
          eliminated: false
        },
        {
          optionId: 2,
          optionName: 'Second',
          mkrSupport: '64.068823529411764706',
          firstPct: 27.77237608661018,
          transfer: '0',
          transferPct: 0,
          winner: false,
          eliminated: false
        },
        {
          optionId: 1,
          optionName: 'First',
          firstPct: 26.019470668655206,
          mkrSupport: '60.025',
          transfer: '-56.025',
          transferPct: -24.285561752793136,
          winner: false,
          eliminated: true
        },
        {
          optionId: 0,
          optionName: 'Abstain',
          firstPct: 0,
          mkrSupport: '0',
          transferPct: 0,
          winner: false
        },
        {
          optionId: 4,
          optionName: 'Fourth',
          firstPct: 1.7339089158620713,
          mkrSupport: '4',
          transfer: '-4',
          transferPct: -1.7339089158620713,
          winner: false,
          eliminated: true
        }
      ],
      numVoters: 4
    };

    expect(result).toEqual(expect.objectContaining(expectedResult));
  });

  it('ranked choice tally verify eliminated options cant get votes', async () => {
    (gqlRequest as jest.Mock).mockResolvedValueOnce({
      voteAddressMkrWeightsAtTime: {
        nodes: [
          {
            mkrSupport: '60.025000000000000000',
            optionIdRaw: fromBuffer([1, 3].reverse())
          },
          {
            mkrSupport: '102.598801867883985831',
            optionIdRaw: fromBuffer([3, 1].reverse())
          },
          {
            mkrSupport: '54.068823529411764706',
            // option 4 should never get these votes since it's eliminated in the first round
            optionIdRaw: fromBuffer([2, 4].reverse())
          },
          {
            mkrSupport: '4',
            optionIdRaw: fromBuffer([4, 1].reverse())
          }
        ]
      }
    });

    const result = await fetchPollTally(mockPoll, SupportedNetworks.MAINNET);

    const expectedResult = {
      parameters: mockPoll.parameters,
      rounds: 4,
      winner: 3,
      victoryConditionMatched: 0,
      winningOptionName: 'Third',
      totalMkrParticipation: '220.692625397295750537',
      totalMkrActiveParticipation: '220.692625397295750537',
      results: [
        {
          optionId: 3,
          optionName: 'Third',
          mkrSupport: '102.598801867883985831',
          firstPct: 46.48945640262485,
          transfer: '60.025',
          transferPct: 27.1984620654821,
          winner: true,
          eliminated: false
        },
        {
          optionId: 2,
          optionName: 'Second',
          mkrSupport: '54.068823529411764706',
          firstPct: 24.499605925696823,
          transfer: '0',
          transferPct: 0,
          winner: false,
          eliminated: true
        },
        {
          optionId: 1,
          optionName: 'First',
          firstPct: 27.1984620654821,
          mkrSupport: '60.025',
          transfer: '-56.025',
          transferPct: -25.385986459285874,
          winner: false,
          eliminated: true
        },

        {
          optionId: 0,
          optionName: 'Abstain',
          firstPct: 0,
          mkrSupport: '0',
          transferPct: 0,
          winner: false
        },
        {
          optionId: 4,
          optionName: 'Fourth',
          firstPct: 1.8124756061962248,
          mkrSupport: '4',
          transfer: '-4',
          transferPct: -1.8124756061962248,
          winner: false,
          eliminated: true
        }
      ],
      numVoters: 4
    };

    expect(result).toEqual(expect.objectContaining(expectedResult));
  });

  // round 1
  // option 1: 101, option 2: 100, option 3: 50, option 4: 49, total: 300
  // round 2
  // option 1: 101, option 2: 100, option 3: 99, option 4: 0, total: 300
  // round 3
  // option 1: 101, option 2: 100, option 3: 0, option 4: 0, total: 300
  // round 4
  // option 1: 201, option 2: 0, option 3: 0, option 4: 0, total: 300
  // winner: option 1
  it('ranked choice tally stop when 1 remains', async () => {
    (gqlRequest as jest.Mock).mockResolvedValueOnce({
      voteAddressMkrWeightsAtTime: {
        nodes: [
          {
            mkrSupport: '101',
            optionIdRaw: fromBuffer([1])
          },
          {
            mkrSupport: '100',
            optionIdRaw: fromBuffer([2, 1].reverse())
          },
          {
            mkrSupport: '50',
            optionIdRaw: fromBuffer([3])
          },
          {
            mkrSupport: '49',
            optionIdRaw: fromBuffer([4, 3].reverse())
          }
        ]
      }
    });

    const result = await fetchPollTally(mockPoll, SupportedNetworks.MAINNET);

    const expectedResult = {
      parameters: mockPoll.parameters,
      rounds: 4,
      winner: 1,
      victoryConditionMatched: 0,
      winningOptionName: 'First',
      totalMkrParticipation: '300',
      totalMkrActiveParticipation: '300',
      results: [
        {
          optionId: 1,
          optionName: 'First',
          firstPct: 33.666666666666664,
          mkrSupport: '101',
          transfer: '100',
          transferPct: 33.333333333333336,
          winner: true,
          eliminated: false
        },

        {
          optionId: 3,
          optionName: 'Third',
          mkrSupport: '50',
          firstPct: 16.666666666666668,
          transfer: '49',
          transferPct: 16.333333333333332,
          winner: false,
          eliminated: true
        },
        {
          optionId: 0,
          optionName: 'Abstain',
          firstPct: 0,
          mkrSupport: '0',
          transferPct: 0,
          winner: false
        },

        {
          optionId: 4,
          optionName: 'Fourth',
          firstPct: 16.333333333333332,
          mkrSupport: '49',
          transfer: '-49',
          transferPct: -16.333333333333332,
          winner: false,
          eliminated: true
        },
        {
          optionId: 2,
          optionName: 'Second',
          mkrSupport: '100',
          firstPct: 33.333333333333336,
          transfer: '-100',
          transferPct: -33.333333333333336,
          winner: false,
          eliminated: true
        }
      ],
      numVoters: 4
    };

    expect(result).toEqual(expect.objectContaining(expectedResult));
  });
});
