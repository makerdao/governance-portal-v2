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

describe('Fetch tally approval', () => {
  const mockPoll: Poll = {
    pollId: 1,
    options: {
      '0': 'Abstain',
      '1': 'Approve Existing Budget',
      '2': 'Approve Increase',
      '3': 'Reject',
      '4': 'None of the above'
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
          type: PollVictoryConditions.approval
        }
      ]
    }
  } as any as Poll;

  it('gives first option as winner if it has most mkr', async () => {
    (gqlRequest as Mock)
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({
        pollVotes: []
      })
      .mockResolvedValueOnce({
        arbitrumPoll: {
          votes: [
            { voter: { id: '0x123' }, choice: '258' },
            { voter: { id: '0x456' }, choice: '258' },
            { voter: { id: '0x789' }, choice: '1' },
            { voter: { id: '0xabc' }, choice: '4' },
            { voter: { id: '0xdef' }, choice: '4' }
          ]
        }
      })
      .mockResolvedValueOnce({
        voters: [
          { id: '0x123', v2VotingPowerChanges: [{ newBalance: '820212580000000000000' }] },
          { id: '0x456', v2VotingPowerChanges: [{ newBalance: '17363000000000000000' }] },
          { id: '0x789', v2VotingPowerChanges: [{ newBalance: '10000000000000000000' }] },
          { id: '0xabc', v2VotingPowerChanges: [{ newBalance: '14000000000000000000' }] },
          { id: '0xdef', v2VotingPowerChanges: [{ newBalance: '0' }] }
        ]
      });

    const result = await fetchPollTally(mockPoll, SupportedNetworks.MAINNET);

    const expectedResult = {
      parameters: mockPoll.parameters,
      winner: 1,
      winningOptionName: 'Approve Existing Budget',
      totalSkyActiveParticipation: '861.57558',
      totalSkyParticipation: '861.57558',
      numVoters: 5,
      victoryConditionMatched: 0,
      results: [
        {
          optionId: 1,
          optionName: 'Approve Existing Budget',
          firstPct: 98.3751,
          skySupport: '847.57558',
          transfer: '0',
          transferPct: 0,
          winner: true,
          eliminated: undefined
        },
        {
          optionId: 2,
          optionName: 'Approve Increase',
          firstPct: 97.2144,
          skySupport: '837.57558',
          transfer: '0',
          transferPct: 0,
          winner: false,
          eliminated: undefined
        },
        {
          optionId: 4,
          optionName: 'None of the above',
          firstPct: 1.6249,
          skySupport: '14',
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
        },
        {
          optionId: 3,
          optionName: 'Reject',
          firstPct: 0,
          skySupport: '0',
          transfer: '0',
          transferPct: 0,
          winner: false,
          eliminated: undefined
        }
      ]
    };

    expect(result).toEqual(expect.objectContaining(expectedResult));
  });

  it('gives no option as winner if both have the same MKR voting weight', async () => {
    (gqlRequest as Mock)
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({
        pollVotes: []
      })
      .mockResolvedValueOnce({
        arbitrumPoll: {
          votes: [
            { voter: { id: '0x123' }, choice: '258' },
            { voter: { id: '0x456' }, choice: '258' },
            { voter: { id: '0x789' }, choice: '4' },
            { voter: { id: '0xabc' }, choice: '4' }
          ]
        }
      })
      .mockResolvedValueOnce({
        voters: [
          { id: '0x123', v2VotingPowerChanges: [{ newBalance: '820212580000000000000' }] },
          { id: '0x456', v2VotingPowerChanges: [{ newBalance: '17363000000000000000' }] },
          { id: '0x789', v2VotingPowerChanges: [{ newBalance: '14000000000000000000' }] },
          { id: '0xabc', v2VotingPowerChanges: [{ newBalance: '0' }] }
        ]
      });

    const result = await fetchPollTally(mockPoll, SupportedNetworks.MAINNET);

    const expectedResult = {
      parameters: mockPoll.parameters,
      winner: null,
      winningOptionName: 'None found',
      totalSkyActiveParticipation: '851.57558',
      totalSkyParticipation: '851.57558',
      numVoters: 4,
      victoryConditionMatched: null,
      results: [
        {
          optionId: 1,
          optionName: 'Approve Existing Budget',
          firstPct: 98.356,
          skySupport: '837.57558',
          transfer: '0',
          transferPct: 0,
          winner: false,
          eliminated: undefined
        },
        {
          optionId: 2,
          optionName: 'Approve Increase',
          firstPct: 98.356,
          skySupport: '837.57558',
          transfer: '0',
          transferPct: 0,
          winner: false,
          eliminated: undefined
        },
        {
          optionId: 4,
          optionName: 'None of the above',
          firstPct: 1.644,
          skySupport: '14',
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
        },
        {
          optionId: 3,
          optionName: 'Reject',
          firstPct: 0,
          skySupport: '0',
          transfer: '0',
          transferPct: 0,
          winner: false,
          eliminated: undefined
        }
      ]
    };

    expect(result).toEqual(expect.objectContaining(expectedResult));
  });

  it('Ignores abstain', async () => {
    (gqlRequest as Mock)
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({
        pollVotes: []
      })
      .mockResolvedValueOnce({
        arbitrumPoll: {
          votes: [{ voter: { id: '0x123' }, choice: '0' }]
        }
      })
      .mockResolvedValueOnce({
        voters: [{ id: '0x123', v2VotingPowerChanges: [{ newBalance: '400000000000000000000' }] }]
      });

    const result = await fetchPollTally(mockPoll, SupportedNetworks.MAINNET);

    const expectedResult = {
      parameters: mockPoll.parameters,
      winner: null,
      winningOptionName: 'None found',
      totalSkyParticipation: '400',
      totalSkyActiveParticipation: '0',
      numVoters: 1,
      victoryConditionMatched: null,
      results: [
        {
          optionId: 0,
          optionName: 'Abstain',
          skySupport: '400',
          transfer: '0',
          firstPct: 100,
          transferPct: 0,
          winner: false,
          eliminated: undefined
        },
        {
          optionId: 1,
          optionName: 'Approve Existing Budget',
          skySupport: '0',
          transfer: '0',
          firstPct: 0,
          transferPct: 0,
          winner: false,
          eliminated: undefined
        },
        {
          optionId: 2,
          optionName: 'Approve Increase',
          skySupport: '0',
          transfer: '0',
          firstPct: 0,
          transferPct: 0,
          winner: false,
          eliminated: undefined
        },
        {
          optionId: 4,
          optionName: 'None of the above',
          firstPct: 0,
          skySupport: '0',
          transfer: '0',
          transferPct: 0,
          winner: false,
          eliminated: undefined
        },

        {
          optionId: 3,
          optionName: 'Reject',
          firstPct: 0,
          skySupport: '0',
          transfer: '0',
          transferPct: 0,
          winner: false,
          eliminated: undefined
        }
      ]
    };

    expect(result).toEqual(expect.objectContaining(expectedResult));
  });
});
