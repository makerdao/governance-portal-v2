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
    (gqlRequest as Mock)
      // .mockResolvedValueOnce({
      //   voteAddressSkyWeightsAtTime: {
      //     nodes: [
      //       {
      //         optionIdRaw: '1',
      //         skySupport: '100'
      //       },
      //       {
      //         optionIdRaw: '2',
      //         skySupport: '90'
      //       },
      //       {
      //         optionIdRaw: '3',
      //         skySupport: '80'
      //       }
      //     ]
      //   }
      // });
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
});
