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

  it('Does not find winner if it doesnt pass the majority percent', async () => {
    // Set up the mock to return different responses based on the query
    (gqlRequest as Mock).mockImplementation(args => {
      const query = args.query;
      if (query.includes('delegates(')) {
        return Promise.resolve({ delegates: [] });
      }
      if (query.includes('allMainnetVoters')) {
        return Promise.resolve({
          pollVotes: [
            {
              voter: {
                id: '0x0000000000000000000000000000000000000000'
              },
              blockTime: '1742327200',
              choice: '1',
              txnHash: '0x123'
            },
            {
              voter: {
                id: '0x0000000000000000000000000000000000000002'
              },
              blockTime: '1742327200',
              choice: '3',
              txnHash: '0x456'
            }
          ]
        });
      } else if (query.includes('allArbitrumVoters')) {
        return Promise.resolve({
          arbitrumPoll: {
            startDate: '1742227200',
            endDate: '1742486400',
            votes: [
              {
                voter: {
                  id: '0x0000000000000000000000000000000000000001'
                },
                blockTime: '1742327200',
                choice: '2',
                txnHash: '0x789'
              }
            ]
          }
        });
      } else if (query.includes('voteAddressMkrWeightsAtTime')) {
        return Promise.resolve({
          voters: [
            {
              id: '0x0000000000000000000000000000000000000000',
              v2VotingPowerChanges: [
                {
                  newBalance: '100000000000000000000'
                }
              ]
            },
            {
              id: '0x0000000000000000000000000000000000000001',
              v2VotingPowerChanges: [
                {
                  newBalance: '90000000000000000000'
                }
              ]
            },
            {
              id: '0x0000000000000000000000000000000000000002',
              v2VotingPowerChanges: [
                {
                  newBalance: '80000000000000000000'
                }
              ]
            }
          ]
        });
      }
      return Promise.resolve({});
    });
    const result = await fetchPollTally(mockPoll, SupportedNetworks.MAINNET);
    const expectedResult = {
      parameters: mockPoll.parameters,
      winner: null,
      winningOptionName: 'None found',
      totalSkyActiveParticipation: '270',
      totalSkyParticipation: '270',
      numVoters: 3,
      victoryConditionMatched: null,
      results: [
        {
          optionId: 1,
          optionName: 'Approve Existing Budget',
          firstPct: 37.037,
          skySupport: '100',
          transferPct: 0,
          winner: false
        },
        {
          optionId: 2,
          optionName: 'Approve Increase',
          firstPct: 33.3333,
          skySupport: '90',
          transferPct: 0,
          winner: false
        },
        {
          optionId: 3,
          optionName: 'Reject',
          firstPct: 29.6296,
          skySupport: '80',
          transferPct: 0,
          winner: false
        },
        {
          optionId: 0,
          optionName: 'Abstain',
          skySupport: '0',
          firstPct: 0,
          transferPct: 0,
          winner: false
        }
      ]
    };

    expect(result).toEqual(expect.objectContaining(expectedResult));
  });

  it('Does find a winner if it pass the majority percent', async () => {
    // Override the entire mock implementation for this test
    (gqlRequest as Mock).mockImplementation(args => {
      const query = args.query;
      if (query.includes('delegates(')) {
        return Promise.resolve({ delegates: [] });
      }
      if (query.includes('allMainnetVoters')) {
        return Promise.resolve({
          pollVotes: [
            {
              voter: {
                id: '0x0000000000000000000000000000000000000000'
              },
              blockTime: '1742327200',
              choice: '1',
              txnHash: '0x123'
            },
            {
              voter: {
                id: '0x0000000000000000000000000000000000000002'
              },
              blockTime: '1742327200',
              choice: '3',
              txnHash: '0x456'
            }
          ]
        });
      } else if (query.includes('allArbitrumVoters')) {
        return Promise.resolve({
          arbitrumPoll: {
            startDate: '1742227200',
            endDate: '1742486400',
            votes: [
              {
                voter: {
                  id: '0x0000000000000000000000000000000000000001'
                },
                blockTime: '1742327200',
                choice: '2',
                txnHash: '0x789'
              }
            ]
          }
        });
      } else if (query.includes('voteAddressMkrWeightsAtTime')) {
        return Promise.resolve({
          voters: [
            {
              id: '0x0000000000000000000000000000000000000000',
              v2VotingPowerChanges: [
                {
                  newBalance: '200000000000000000000' // Changed from 100 to 200
                }
              ]
            },
            {
              id: '0x0000000000000000000000000000000000000001',
              v2VotingPowerChanges: [
                {
                  newBalance: '90000000000000000000'
                }
              ]
            },
            {
              id: '0x0000000000000000000000000000000000000002',
              v2VotingPowerChanges: [
                {
                  newBalance: '80000000000000000000'
                }
              ]
            }
          ]
        });
      }
      return Promise.resolve({});
    });

    const result = await fetchPollTally(mockPoll, SupportedNetworks.MAINNET);

    const expectedResult = {
      parameters: mockPoll.parameters,
      winner: 1,
      winningOptionName: 'Approve Existing Budget',
      totalSkyActiveParticipation: '370',
      totalSkyParticipation: '370',
      numVoters: 3,
      victoryConditionMatched: 0,
      results: [
        {
          optionId: 1,
          optionName: 'Approve Existing Budget',
          firstPct: 54.0541,
          skySupport: '200',
          transferPct: 0,
          winner: true
        },
        {
          optionId: 2,
          optionName: 'Approve Increase',
          firstPct: 24.3243,
          skySupport: '90',
          transferPct: 0,
          winner: false
        },
        {
          optionId: 3,
          optionName: 'Reject',
          firstPct: 21.6216,
          skySupport: '80',
          transferPct: 0,
          winner: false
        },
        {
          optionId: 0,
          optionName: 'Abstain',
          skySupport: '0',
          firstPct: 0,
          transferPct: 0,
          winner: false
        }
      ]
    };

    expect(result).toEqual(expect.objectContaining(expectedResult));
  });
});
