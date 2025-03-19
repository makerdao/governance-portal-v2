/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { PollInputFormat, PollResultDisplay, PollVictoryConditions } from 'modules/polling/polling.constants';
import { Poll } from 'modules/polling/types';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { gqlRequest } from '../../../../modules/gql/gqlRequest';
import { fetchPollTally } from '../fetchPollTally';
import { Mock, vi } from 'vitest';

vi.mock('modules/gql/gqlRequest');

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

  beforeEach(() => {
    vi.resetAllMocks();
    
    // Set up the mock to return different responses based on the query
    (gqlRequest as Mock).mockImplementation(args => {
        console.log('args', args);
      const query = args.query;
      console.log('query', query);
      console.log('typeof query', typeof query);
      if (query.includes('delegates(')) {
        return Promise.resolve({delegates: []});
      }
      if (query.includes('allMainnetVoters')) {
        console.log('Query is allMainnetVoters');
        return Promise.resolve({
          polls: [{
            startDate: '1742227200',
            endDate: '1742486400',
            votes: [{
                voter: {
                    id: '0x0000000000000000000000000000000000000000'
                },
                blockTime: '1742327200',
                choice: '1',
                txnHash: '0x0000000000000000000000000000000000000000000000000000000000000000'
            }]
          }]
        });
      } else if (query.includes('allArbitrumVoters')) {
        return Promise.resolve({
          arbitrumPollVotes: [
            {
                voter: {
                    id: '0x0000000000000000000000000000000000000001'
                },
                blockTime: '1742327200',
                choice: '1',
                txnHash: '0x0000000000000000000000000000000000000000000000000000000000000001'
            }]
        });
      } else if (query.includes('voteAddressMkrWeightsAtTime')) {
        return Promise.resolve({
            voters: [{
                id: '0x0000000000000000000000000000000000000000',
                votingPowerChange: {
                    newBalance: '100000000000000000000',
                }
            },
            {
                id: '0x0000000000000000000000000000000000000001',
                votingPowerChange: {
                    newBalance: '100000000000000000000',
                }
            }
        ]
        });
      }
      return Promise.resolve({});
    });
  });

  it.only('Does not find winner if it doesnt pass the majority percent', async () => {
    const result = await fetchPollTally(mockPoll, SupportedNetworks.MAINNET);

    const expectedResult = {
      parameters: mockPoll.parameters,
      winner: null,
      winningOptionName: 'None found',
      totalMkrActiveParticipation: '270000000000000000000',
      totalMkrParticipation: '270000000000000000000',
      numVoters: 3,
      victoryConditionMatched: null,
      results: [
        {
          optionId: 1,
          optionName: 'Approve Existing Budget',
          firstPct: 37.037,
          mkrSupport: '100000000000000000000',
          transferPct: 0,
          winner: false
        },
        {
          optionId: 2,
          optionName: 'Approve Increase',
          firstPct: 33.3333,
          mkrSupport: '90000000000000000000',
          transferPct: 0,
          winner: false
        },
        {
          optionId: 3,
          optionName: 'Reject',
          firstPct: 29.6296,
          mkrSupport: '80000000000000000000',
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
    // Override the default mock for this specific test
    (gqlRequest as Mock).mockImplementation((query, variables, config) => {
      if (query.includes('voteAddressMkrWeightsAtTime')) {
        return Promise.resolve({
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
      }
      // ... handle other queries as needed
      return Promise.resolve({});
    });

    const result = await fetchPollTally(mockPoll, SupportedNetworks.MAINNET);

    const expectedResult = {
      parameters: mockPoll.parameters,
      winner: 1,
      winningOptionName: 'Approve Existing Budget',
      totalMkrActiveParticipation: '370000000000000000000',
      totalMkrParticipation: '370000000000000000000',
      numVoters: 3,
      victoryConditionMatched: 0,
      results: [
        {
          optionId: 1,
          optionName: 'Approve Existing Budget',
          firstPct: 54.0541,
          mkrSupport: '200000000000000000000',
          transferPct: 0,
          winner: true
        },
        {
          optionId: 2,
          optionName: 'Approve Increase',
          firstPct: 24.3243,
          mkrSupport: '90000000000000000000',
          transferPct: 0,
          winner: false
        },
        {
          optionId: 3,
          optionName: 'Reject',
          firstPct: 21.6216,
          mkrSupport: '80000000000000000000',
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
