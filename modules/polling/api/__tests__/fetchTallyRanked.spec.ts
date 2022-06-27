import { gqlRequest } from '../../../../modules/gql/gqlRequest';
import { fetchSpockPollById } from '../fetchPollBy';
import { fetchTallyRankedChoice } from '../fetchTallyRankedChoice';
import BigNumber from 'bignumber.js';
import { SupportedNetworks } from 'modules/web3/constants/networks';
jest.mock('modules/gql/gqlRequest');
jest.mock('../fetchPollBy');

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
  beforeAll(() => {
    (fetchSpockPollById as jest.Mock).mockResolvedValue({
      pollId: 1
    });
  });

  it('gives expected results for a tally with majority', async () => {
    (gqlRequest as jest.Mock).mockResolvedValueOnce({
      voteMkrWeightsAtTimeRankedChoice: {
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

    const result = await fetchTallyRankedChoice(1, SupportedNetworks.MAINNET);

    const expectedResult = {
      rounds: 1,
      winner: '3',
      totalMkrParticipation: '324.692625397295750537',
      options: {
        '1': {
          firstChoice: '60.025',
          transfer: '0',
          winner: false,
          eliminated: false
        },
        '2': {
          firstChoice: '64.068823529411764706',
          transfer: '0',
          winner: false,
          eliminated: false
        },
        '3': {
          firstChoice: '200.598801867883985831',
          transfer: '0',
          winner: true,
          eliminated: false
        }
      },
      numVoters: 3
    };

    expect(JSON.parse(JSON.stringify(result))).toEqual(expectedResult);
  });
  it('gives expected results for a tally with no  majority', async () => {
    (gqlRequest as jest.Mock).mockResolvedValueOnce({
      voteMkrWeightsAtTimeRankedChoice: {
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

    const result = await fetchTallyRankedChoice(1, SupportedNetworks.MAINNET);

    const expectedResult = {
      rounds: 2,
      winner: '3',
      totalMkrParticipation: '226.692625397295750537',
      options: {
        '1': {
          firstChoice: '60.025',
          transfer: '-60.025',
          winner: false,
          eliminated: true
        },
        '2': {
          firstChoice: '64.068823529411764706',
          transfer: '0',
          winner: false,
          eliminated: false
        },
        '3': {
          firstChoice: '102.598801867883985831',
          transfer: '60.025',
          winner: true,
          eliminated: false
        }
      },
      numVoters: 3
    };

    expect(JSON.parse(JSON.stringify(result))).toEqual(expectedResult);
  });

  it('gives expected results for a tally with multiple rounds', async () => {
    (gqlRequest as jest.Mock).mockResolvedValueOnce({
      voteMkrWeightsAtTimeRankedChoice: {
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

    const result = await fetchTallyRankedChoice(1, SupportedNetworks.MAINNET);

    const expectedResult = {
      rounds: 3,
      winner: '3',
      totalMkrParticipation: '230.692625397295750537',
      options: {
        '1': {
          firstChoice: '60.025',
          transfer: '-56.025',
          winner: false,
          eliminated: true
        },
        '2': {
          firstChoice: '64.068823529411764706',
          transfer: '0',
          winner: false,
          eliminated: false
        },
        '3': {
          firstChoice: '102.598801867883985831',
          transfer: '60.025',
          winner: true,
          eliminated: false
        },
        '4': {
          firstChoice: '4',
          transfer: '-4',
          winner: false,
          eliminated: true
        }
      },
      numVoters: 4
    };

    expect(JSON.parse(JSON.stringify(result))).toEqual(expectedResult);
  });

  it('ranked choice tally verify eliminated options cant get votes', async () => {
    (gqlRequest as jest.Mock).mockResolvedValueOnce({
      voteMkrWeightsAtTimeRankedChoice: {
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

    const result = await fetchTallyRankedChoice(1, SupportedNetworks.MAINNET);

    const expectedResult = {
      rounds: 4,
      winner: '3',
      totalMkrParticipation: '220.692625397295750537',
      options: {
        '1': {
          firstChoice: '60.025',
          transfer: '-56.025',
          winner: false,
          eliminated: true
        },
        '2': {
          firstChoice: '54.068823529411764706',
          transfer: '0',
          winner: false,
          eliminated: true
        },
        '3': {
          firstChoice: '102.598801867883985831',
          transfer: '60.025',
          winner: true,
          eliminated: false
        },
        '4': {
          firstChoice: '4',
          transfer: '-4',
          winner: false,
          eliminated: true
        }
      },
      numVoters: 4
    };

    expect(JSON.parse(JSON.stringify(result))).toEqual(expectedResult);
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
      voteMkrWeightsAtTimeRankedChoice: {
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

    const result = await fetchTallyRankedChoice(1, SupportedNetworks.MAINNET);

    const expectedResult = {
      rounds: 4,
      winner: '1',
      totalMkrParticipation: '300',
      options: {
        '1': {
          firstChoice: '101',
          transfer: '100',
          winner: true,
          eliminated: false
        },
        '2': {
          firstChoice: '100',
          transfer: '-100',
          winner: false,
          eliminated: true
        },
        '3': {
          firstChoice: '50',
          transfer: '49',
          winner: false,
          eliminated: true
        },
        '4': {
          firstChoice: '49',
          transfer: '-49',
          winner: false,
          eliminated: true
        }
      },
      numVoters: 4
    };

    expect(JSON.parse(JSON.stringify(result))).toEqual(expectedResult);
  });
});
