/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { PollInputFormat, PollResultDisplay, PollVictoryConditions } from 'modules/polling/polling.constants';
import { Poll } from 'modules/polling/types';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { gqlRequest } from '../../../gql/gqlRequest';
import { fetchPollTally } from '../fetchPollTally';
import { Mock, vi } from 'vitest';

vi.mock('modules/gql/gqlRequest');

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

  return BigInt('0x' + hex.join(''));
};

describe('Fetch tally combined with other options', () => {
  const mockPollApproval: Poll = {
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
          type: PollVictoryConditions.and,
          conditions: [
            {
              type: PollVictoryConditions.approval
            },
            {
              type: PollVictoryConditions.majority,
              percent: 50
            }
          ]
        },
        {
          type: PollVictoryConditions.default,
          value: 3
        }
      ]
    }
  } as any as Poll;

  it('Does not find winner if it doesnt pass the majority percent, and it defaults to 3', async () => {
    (gqlRequest as Mock)
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({
        pollVotes: []
      })
      .mockResolvedValueOnce({
        arbitrumPoll: {
          votes: [
            { voter: { id: '0x123' }, choice: '1' },
            { voter: { id: '0x456' }, choice: '2' },
            { voter: { id: '0x789' }, choice: '3' }
          ]
        }
      })
      .mockResolvedValueOnce({
        voters: [
          { id: '0x123', v2VotingPowerChanges: [{ newBalance: '100000000000000000000' }] },
          { id: '0x456', v2VotingPowerChanges: [{ newBalance: '90000000000000000000' }] },
          { id: '0x789', v2VotingPowerChanges: [{ newBalance: '80000000000000000000' }] }
        ]
      });

    const result = await fetchPollTally(mockPollApproval, SupportedNetworks.MAINNET);

    const expectedResult = {
      parameters: mockPollApproval.parameters,
      winner: 3,
      winningOptionName: 'Reject',
      totalSkyActiveParticipation: '270',
      totalSkyParticipation: '270',
      victoryConditionMatched: 1,
      numVoters: 3,
      results: [
        {
          optionId: 1,
          optionName: 'Approve Existing Budget',
          firstPct: 37.037,
          skySupport: '100',
          transfer: '0',
          transferPct: 0,
          winner: false,
          eliminated: undefined
        },
        {
          optionId: 2,
          optionName: 'Approve Increase',
          firstPct: 33.3333,
          skySupport: '90',
          transfer: '0',
          transferPct: 0,
          winner: false,
          eliminated: undefined
        },
        {
          optionId: 3,
          optionName: 'Reject',
          firstPct: 29.6296,
          skySupport: '80',
          transfer: '0',
          transferPct: 0,
          winner: true,
          eliminated: undefined
        },
        {
          optionId: 0,
          optionName: 'Abstain',
          skySupport: '0',
          transfer: '0',
          firstPct: 0,
          transferPct: 0,
          winner: false,
          eliminated: undefined
        }
      ]
    };

    expect(result).toEqual(expect.objectContaining(expectedResult));
  });

  it('Does find a winner if it pass the majority percent', async () => {
    (gqlRequest as Mock)
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({
        pollVotes: []
      })
      .mockResolvedValueOnce({
        arbitrumPoll: {
          votes: [
            { voter: { id: '0x123' }, choice: '1' },
            { voter: { id: '0x456' }, choice: '2' },
            { voter: { id: '0x789' }, choice: '3' }
          ]
        }
      })
      .mockResolvedValueOnce({
        voters: [
          { id: '0x123', v2VotingPowerChanges: [{ newBalance: '200000000000000000000' }] },
          { id: '0x456', v2VotingPowerChanges: [{ newBalance: '90000000000000000000' }] },
          { id: '0x789', v2VotingPowerChanges: [{ newBalance: '80000000000000000000' }] }
        ]
      });

    const result = await fetchPollTally(mockPollApproval, SupportedNetworks.MAINNET);

    const expectedResult = {
      parameters: mockPollApproval.parameters,
      winner: 1,
      winningOptionName: 'Approve Existing Budget',
      totalSkyActiveParticipation: '370',
      totalSkyParticipation: '370',
      victoryConditionMatched: 0,
      numVoters: 3,
      results: [
        {
          optionId: 1,
          optionName: 'Approve Existing Budget',
          firstPct: 54.0541,
          skySupport: '200',
          transfer: '0',
          transferPct: 0,
          winner: true,
          eliminated: undefined
        },
        {
          optionId: 2,
          optionName: 'Approve Increase',
          firstPct: 24.3243,
          skySupport: '90',
          transfer: '0',
          transferPct: 0,
          winner: false,
          eliminated: undefined
        },
        {
          optionId: 3,
          optionName: 'Reject',
          firstPct: 21.6216,
          skySupport: '80',
          transfer: '0',
          transferPct: 0,
          winner: false,
          eliminated: undefined
        },
        {
          optionId: 0,
          optionName: 'Abstain',
          skySupport: '0',
          transfer: '0',
          firstPct: 0,
          transferPct: 0,
          winner: false,
          eliminated: undefined
        }
      ]
    };

    expect(result).toEqual(expect.objectContaining(expectedResult));
  });

  const mockPollRanked: Poll = {
    pollId: 1,
    options: {
      '0': 'Abstain',
      '1': 'Approve Existing Budget',
      '2': 'Approve Increase',
      '3': 'Reject',
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
          type: PollVictoryConditions.and,
          conditions: [
            {
              type: PollVictoryConditions.instantRunoff
            },
            {
              type: PollVictoryConditions.majority,
              percent: 50
            }
          ]
        },
        {
          type: PollVictoryConditions.default,
          value: 3
        }
      ]
    }
  } as any as Poll;

  it('ranked choice + majority when majority is not met', async () => {
    (gqlRequest as Mock)
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({
        pollVotes: []
      })
      .mockResolvedValueOnce({
        arbitrumPoll: {
          votes: [
            { voter: { id: '0x123' }, choice: fromBuffer([1]) },
            { voter: { id: '0x456' }, choice: fromBuffer([2].reverse()) },
            { voter: { id: '0x789' }, choice: fromBuffer([3]) },
            { voter: { id: '0xabc' }, choice: fromBuffer([4].reverse()) }
          ]
        }
      })
      .mockResolvedValueOnce({
        voters: [
          { id: '0x123', v2VotingPowerChanges: [{ newBalance: '101000000000000000000' }] },
          { id: '0x456', v2VotingPowerChanges: [{ newBalance: '100000000000000000000' }] },
          { id: '0x789', v2VotingPowerChanges: [{ newBalance: '50000000000000000000' }] },
          { id: '0xabc', v2VotingPowerChanges: [{ newBalance: '49000000000000000000' }] }
        ]
      });

    const result = await fetchPollTally(mockPollRanked, SupportedNetworks.MAINNET);

    const expectedResult = {
      parameters: mockPollRanked.parameters,
      winner: 3,
      victoryConditionMatched: 1,
      winningOptionName: 'Reject',
      totalSkyActiveParticipation: '300',
      totalSkyParticipation: '300',
      results: [
        {
          optionId: 1,
          optionName: 'Approve Existing Budget',
          firstPct: 33.6667,
          skySupport: '101',
          transfer: '0',
          transferPct: 0,
          winner: false,
          eliminated: undefined
        },

        {
          optionId: 2,
          optionName: 'Approve Increase',
          firstPct: 33.3333,
          skySupport: '100',
          transfer: '0',
          transferPct: 0,
          winner: false,
          eliminated: undefined
        },

        {
          optionId: 3,
          optionName: 'Reject',
          firstPct: 16.6667,
          skySupport: '50',
          transfer: '0',
          transferPct: 0,
          winner: true,
          eliminated: undefined
        },
        {
          optionId: 4,
          optionName: 'Fourth',
          firstPct: 16.3333,
          skySupport: '49',
          transfer: '0',
          transferPct: 0,
          winner: false,
          eliminated: undefined
        },
        {
          optionId: 0,
          optionName: 'Abstain',
          firstPct: 0,
          skySupport: '0',
          transfer: '0',
          transferPct: 0,
          winner: false,
          eliminated: undefined
        }
      ],
      numVoters: 4
    };

    expect(result).toEqual(expect.objectContaining(expectedResult));
  });

  it('ranked choice + majority when majority is  met', async () => {
    (gqlRequest as Mock)
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({
        pollVotes: []
      })
      .mockResolvedValueOnce({
        arbitrumPoll: {
          votes: [
            { voter: { id: '0x123' }, choice: fromBuffer([1]) },
            { voter: { id: '0x456' }, choice: fromBuffer([2].reverse()) },
            { voter: { id: '0x789' }, choice: fromBuffer([3]) },
            { voter: { id: '0xabc' }, choice: fromBuffer([4].reverse()) }
          ]
        }
      })
      .mockResolvedValueOnce({
        voters: [
          { id: '0x123', v2VotingPowerChanges: [{ newBalance: '301000000000000000000' }] },
          { id: '0x456', v2VotingPowerChanges: [{ newBalance: '100000000000000000000' }] },
          { id: '0x789', v2VotingPowerChanges: [{ newBalance: '50000000000000000000' }] },
          { id: '0xabc', v2VotingPowerChanges: [{ newBalance: '49000000000000000000' }] }
        ]
      });

    const result = await fetchPollTally(mockPollRanked, SupportedNetworks.MAINNET);

    const expectedResult = {
      parameters: mockPollRanked.parameters,
      winner: 1,
      winningOptionName: 'Approve Existing Budget',
      totalSkyActiveParticipation: '500',
      totalSkyParticipation: '500',
      victoryConditionMatched: 0,
      rounds: 1,
      results: [
        {
          optionId: 1,
          eliminated: false,
          optionName: 'Approve Existing Budget',
          firstPct: 60.2,
          skySupport: '301',
          transferPct: 0,
          transfer: '0',
          winner: true
        },

        {
          optionId: 2,
          optionName: 'Approve Increase',
          firstPct: 20,
          skySupport: '100',
          transferPct: 0,
          transfer: '0',
          eliminated: false,
          winner: false
        },

        {
          optionId: 3,
          optionName: 'Reject',
          skySupport: '50',
          firstPct: 10,
          transferPct: 0,
          transfer: '0',
          eliminated: false,
          winner: false
        },
        {
          optionId: 4,
          optionName: 'Fourth',
          firstPct: 9.8,
          skySupport: '49',
          transferPct: 0,
          transfer: '0',
          eliminated: false,
          winner: false
        },
        {
          optionId: 0,
          optionName: 'Abstain',
          firstPct: 0,
          skySupport: '0',
          transferPct: 0,
          transfer: '0',
          eliminated: undefined,
          winner: false
        }
      ],
      numVoters: 4
    };

    expect(result).toEqual(expect.objectContaining(expectedResult));
  });

  const mockPollRankedComparison: Poll = {
    pollId: 1,
    options: {
      '0': 'Abstain',
      '1': 'Approve Existing Budget',
      '2': 'Approve Increase',
      '3': 'Reject',
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
          type: PollVictoryConditions.and,
          conditions: [
            {
              type: PollVictoryConditions.instantRunoff
            },
            {
              type: PollVictoryConditions.majority,
              percent: 50
            },
            {
              type: PollVictoryConditions.comparison,
              value: 3000,
              comparator: '>='
            }
          ]
        }
      ]
    }
  } as any as Poll;

  it('ranked choice + majority when majority is  met + comparison not met', async () => {
    (gqlRequest as Mock)
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({
        pollVotes: []
      })
      .mockResolvedValueOnce({
        arbitrumPoll: {
          votes: [
            { voter: { id: '0x123' }, choice: fromBuffer([1]) },
            { voter: { id: '0x456' }, choice: fromBuffer([2].reverse()) },
            { voter: { id: '0x789' }, choice: fromBuffer([3]) },
            { voter: { id: '0xabc' }, choice: fromBuffer([4].reverse()) }
          ]
        }
      })
      .mockResolvedValueOnce({
        voters: [
          { id: '0x123', v2VotingPowerChanges: [{ newBalance: '301000000000000000000' }] },
          { id: '0x456', v2VotingPowerChanges: [{ newBalance: '100000000000000000000' }] },
          { id: '0x789', v2VotingPowerChanges: [{ newBalance: '50000000000000000000' }] },
          { id: '0xabc', v2VotingPowerChanges: [{ newBalance: '49000000000000000000' }] }
        ]
      });

    const result = await fetchPollTally(mockPollRankedComparison, SupportedNetworks.MAINNET);

    const expectedResult = {
      parameters: mockPollRankedComparison.parameters,
      winner: null,
      winningOptionName: 'None found',
      totalSkyActiveParticipation: '500',
      totalSkyParticipation: '500',
      victoryConditionMatched: null,
      results: [
        {
          optionId: 1,
          optionName: 'Approve Existing Budget',
          firstPct: 60.2,
          skySupport: '301',
          transfer: '0',
          transferPct: 0,
          winner: false,
          eliminated: undefined
        },

        {
          optionId: 2,
          optionName: 'Approve Increase',
          firstPct: 20,
          skySupport: '100',
          transfer: '0',
          transferPct: 0,
          winner: false,
          eliminated: undefined
        },

        {
          optionId: 3,
          optionName: 'Reject',
          skySupport: '50',
          transfer: '0',
          firstPct: 10,
          transferPct: 0,
          winner: false,
          eliminated: undefined
        },
        {
          optionId: 4,
          optionName: 'Fourth',
          firstPct: 9.8,
          skySupport: '49',
          transfer: '0',
          transferPct: 0,
          winner: false,
          eliminated: undefined
        },
        {
          optionId: 0,
          optionName: 'Abstain',
          firstPct: 0,
          skySupport: '0',
          transfer: '0',
          transferPct: 0,
          winner: false,
          eliminated: undefined
        }
      ],
      numVoters: 4
    };

    expect(result).toEqual(expect.objectContaining(expectedResult));
  });

  it('ranked choice + majority when majority is met + comparison met', async () => {
    (gqlRequest as Mock)
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({
        pollVotes: []
      })
      .mockResolvedValueOnce({
        arbitrumPoll: {
          votes: [
            { voter: { id: '0x123' }, choice: fromBuffer([1]) },
            { voter: { id: '0x456' }, choice: fromBuffer([2].reverse()) },
            { voter: { id: '0x789' }, choice: fromBuffer([3]) },
            { voter: { id: '0xabc' }, choice: fromBuffer([4].reverse()) }
          ]
        }
      })
      .mockResolvedValueOnce({
        voters: [
          { id: '0x123', v2VotingPowerChanges: [{ newBalance: '3001000000000000000000' }] },
          { id: '0x456', v2VotingPowerChanges: [{ newBalance: '100000000000000000000' }] },
          { id: '0x789', v2VotingPowerChanges: [{ newBalance: '50000000000000000000' }] },
          { id: '0xabc', v2VotingPowerChanges: [{ newBalance: '49000000000000000000' }] }
        ]
      });

    const result = await fetchPollTally(mockPollRankedComparison, SupportedNetworks.MAINNET);

    const expectedResult = {
      parameters: mockPollRankedComparison.parameters,
      winner: 1,
      winningOptionName: 'Approve Existing Budget',
      totalSkyActiveParticipation: '3200',
      totalSkyParticipation: '3200',
      victoryConditionMatched: 0,
      rounds: 1,
      results: [
        {
          optionId: 1,
          eliminated: false,
          optionName: 'Approve Existing Budget',
          firstPct: 93.7813,
          skySupport: '3001',
          transferPct: 0,
          transfer: '0',
          winner: true
        },

        {
          optionId: 2,
          optionName: 'Approve Increase',
          firstPct: 3.125,
          skySupport: '100',
          transferPct: 0,
          transfer: '0',
          eliminated: false,
          winner: false
        },

        {
          optionId: 3,
          optionName: 'Reject',
          skySupport: '50',
          firstPct: 1.5625,
          transferPct: 0,
          transfer: '0',
          eliminated: false,
          winner: false
        },
        {
          optionId: 4,
          optionName: 'Fourth',
          firstPct: 1.5313,
          skySupport: '49',
          transferPct: 0,
          transfer: '0',
          eliminated: false,
          winner: false
        },
        {
          optionId: 0,
          optionName: 'Abstain',
          firstPct: 0,
          skySupport: '0',
          transfer: '0',
          transferPct: 0,
          winner: false,
          eliminated: undefined
        }
      ],
      numVoters: 4
    };

    expect(result).toEqual(expect.objectContaining(expectedResult));
  });
});
