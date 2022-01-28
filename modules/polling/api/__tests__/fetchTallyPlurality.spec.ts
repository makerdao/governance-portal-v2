import { gqlRequest } from '../../../../modules/gql/gqlRequest';
import { fetchSpockPollById } from '../fetchPollBy';
import { fetchTallyPlurality } from '../fetchTallyPlurality';
jest.mock('modules/gql/gqlRequest');
jest.mock('../fetchPollBy');

describe('Fetch tally plurality', () => {
  beforeAll(() => {
    (fetchSpockPollById as jest.Mock).mockResolvedValue({
      pollId: 1
    });
  });

  it('gives expected results', async () => {
    (gqlRequest as jest.Mock).mockResolvedValueOnce({
      voteMkrWeightsAtTimeRankedChoice: {
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

    const result = await fetchTallyPlurality(1, 'mainnet');

    const expectedResult = {
      winner: '1',
      pollVoteType: 'Plurality Voting',
      totalMkrParticipation: '809',
      numVoters: 5,
      options: {
        '0': {
          mkrSupport: '109',
          winner: false
        },
        '1': {
          mkrSupport: '700',
          winner: true
        }
      }
    };

    expect(JSON.parse(JSON.stringify(result))).toEqual(expectedResult);
  });

  it('gives expected results for adjusted data', async () => {
    (gqlRequest as jest.Mock).mockResolvedValueOnce({
      voteMkrWeightsAtTimeRankedChoice: {
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

    const result = await fetchTallyPlurality(1, 'mainnet');

    const expectedResult = {
      winner: '2',
      pollVoteType: 'Plurality Voting',

      totalMkrParticipation: '2041',
      numVoters: 7,
      options: {
        '0': {
          mkrSupport: '109',
          winner: false
        },
        '1': {
          mkrSupport: '700',
          winner: false
        },
        '2': {
          mkrSupport: '1232',
          winner: true
        }
      }
    };

    expect(JSON.parse(JSON.stringify(result))).toEqual(expectedResult);
  });

  it('parses correctly a plurality with no votes', async () => {
    (gqlRequest as jest.Mock).mockResolvedValueOnce({
      voteMkrWeightsAtTimeRankedChoice: {
        nodes: []
      }
    });

    const result = await fetchTallyPlurality(1, 'mainnet');

    const expectedResult = {
      winner: null,
      pollVoteType: 'Plurality Voting',

      totalMkrParticipation: '0',
      numVoters: 0,
      options: {}
    };

    expect(JSON.parse(JSON.stringify(result))).toEqual(expectedResult);
  });

  it('gives expected results for tally with abstain majority', async () => {
    (gqlRequest as jest.Mock).mockResolvedValueOnce({
      voteMkrWeightsAtTimeRankedChoice: {
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

    const result = await fetchTallyPlurality(1, 'mainnet');

    const expectedResult = {
      winner: '1',
      pollVoteType: 'Plurality Voting',

      totalMkrParticipation: '2041',
      numVoters: 7,
      options: {
        '0': {
          mkrSupport: '1309',
          winner: false
        },
        '1': {
          mkrSupport: '700',
          winner: true
        },
        '2': {
          mkrSupport: '32',
          winner: false
        }
      }
    };

    expect(JSON.parse(JSON.stringify(result))).toEqual(expectedResult);
  });
});
