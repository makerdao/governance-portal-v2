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
    (gqlRequest as Mock)
      // .mockResolvedValueOnce({
      //   voteAddressMkrWeightsAtTime: {
      //     nodes: [
      //       {
      //         optionIdRaw: '1',
      //         skySupport: '40'
      //       },
      //       {
      //         optionIdRaw: '1',
      //         skySupport: '60'
      //       },
      //       {
      //         optionIdRaw: '0',
      //         skySupport: '77'
      //       },
      //       {
      //         optionIdRaw: '0',
      //         skySupport: '32'
      //       },
      //       {
      //         optionIdRaw: '1',
      //         skySupport: '600'
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
            { voter: { id: '0x456' }, choice: '1' },
            { voter: { id: '0x789' }, choice: '0' },
            { voter: { id: '0xabc' }, choice: '0' },
            { voter: { id: '0x1aa' }, choice: '1' }
          ]
        }
      })
      .mockResolvedValueOnce({
        voters: [
          { id: '0x123', v2VotingPowerChanges: [{ newBalance: '40000000000000000000' }] },
          { id: '0x456', v2VotingPowerChanges: [{ newBalance: '60000000000000000000' }] },
          { id: '0x789', v2VotingPowerChanges: [{ newBalance: '77000000000000000000' }] },
          { id: '0xabc', v2VotingPowerChanges: [{ newBalance: '32000000000000000000' }] },
          { id: '0x1aa', v2VotingPowerChanges: [{ newBalance: '600000000000000000000' }] }
        ]
      });

    const result = await fetchPollTally(mockPoll, SupportedNetworks.MAINNET);

    const expectedResult = {
      parameters: mockPoll.parameters,
      winner: 1,
      winningOptionName: 'First',
      totalSkyActiveParticipation: '700',
      totalSkyParticipation: '809',
      victoryConditionMatched: 0,
      numVoters: 5,
      results: [
        {
          optionId: 1,
          optionName: 'First',
          firstPct: 86.5266,
          skySupport: '700',
          transfer: '0',
          transferPct: 0,
          winner: true,
          eliminated: undefined
        },
        {
          optionId: 0,
          optionName: 'Abstain',
          firstPct: 13.4734,
          skySupport: '109',
          transfer: '0',
          transferPct: 0,
          winner: false,
          eliminated: undefined
        },
        {
          optionId: 4,
          optionName: 'Fourth',
          firstPct: 0,
          skySupport: '0',
          transfer: '0',
          transferPct: 0,
          winner: false,
          eliminated: undefined
        },
        {
          optionId: 2,
          optionName: 'Second',
          skySupport: '0',
          transfer: '0',
          firstPct: 0,
          transferPct: 0,
          winner: false,
          eliminated: undefined
        },
        {
          optionId: 3,
          optionName: 'Third',
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

  it('gives expected results for adjusted data', async () => {
    (gqlRequest as Mock)
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({
        pollVotes: []
      })
      .mockResolvedValueOnce({
        arbitrumPoll: {
          votes: [
            { voter: { id: '0x123' }, choice: '1' },
            { voter: { id: '0x456' }, choice: '1' },
            { voter: { id: '0x789' }, choice: '0' },
            { voter: { id: '0xabc' }, choice: '0' },
            { voter: { id: '0x1aa' }, choice: '1' },
            { voter: { id: '0x2bb' }, choice: '2' },
            { voter: { id: '0x3cc' }, choice: '2' }
          ]
        }
      })
      .mockResolvedValueOnce({
        voters: [
          { id: '0x123', v2VotingPowerChanges: [{ newBalance: '40000000000000000000' }] },
          { id: '0x456', v2VotingPowerChanges: [{ newBalance: '60000000000000000000' }] },
          { id: '0x789', v2VotingPowerChanges: [{ newBalance: '77000000000000000000' }] },
          { id: '0xabc', v2VotingPowerChanges: [{ newBalance: '32000000000000000000' }] },
          { id: '0x1aa', v2VotingPowerChanges: [{ newBalance: '600000000000000000000' }] },
          { id: '0x2bb', v2VotingPowerChanges: [{ newBalance: '32000000000000000000' }] },
          { id: '0x3cc', v2VotingPowerChanges: [{ newBalance: '1200000000000000000000' }] }
        ]
      });

    const result = await fetchPollTally(mockPoll, SupportedNetworks.MAINNET);

    const expectedResult = {
      parameters: mockPoll.parameters,
      winner: 2,
      winningOptionName: 'Second',
      totalSkyActiveParticipation: '1932',
      totalSkyParticipation: '2041',
      victoryConditionMatched: 0,
      numVoters: 7,
      results: [
        {
          optionId: 2,
          optionName: 'Second',
          firstPct: 60.3626,
          skySupport: '1232',
          transfer: '0',
          transferPct: 0,
          winner: true,
          eliminated: undefined
        },
        {
          optionId: 1,
          optionName: 'First',
          firstPct: 34.2969,
          skySupport: '700',
          transfer: '0',
          transferPct: 0,
          winner: false,
          eliminated: undefined
        },
        {
          optionId: 0,
          optionName: 'Abstain',
          firstPct: 5.3405,
          skySupport: '109',
          transfer: '0',
          transferPct: 0,
          winner: false,
          eliminated: undefined
        },
        {
          optionId: 4,
          optionName: 'Fourth',
          firstPct: 0,
          skySupport: '0',
          transfer: '0',
          transferPct: 0,
          winner: false,
          eliminated: undefined
        },
        {
          optionId: 3,
          optionName: 'Third',
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

  it('parses correctly a plurality with no votes', async () => {
    (gqlRequest as Mock)
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({
        pollVotes: []
      })
      .mockResolvedValueOnce({
        arbitrumPoll: {
          votes: []
        }
      })
      .mockResolvedValueOnce({
        voters: []
      });

    const result = await fetchPollTally(mockPoll, SupportedNetworks.MAINNET);

    const expectedResult = {
      parameters: mockPoll.parameters,
      winner: null,
      winningOptionName: 'None found',
      totalSkyParticipation: '0',
      victoryConditionMatched: null,
      totalSkyActiveParticipation: '0',
      numVoters: 0,
      results: [
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
          optionId: 1,
          optionName: 'First',
          skySupport: '0',
          transfer: '0',
          firstPct: 0,
          transferPct: 0,
          winner: false,
          eliminated: undefined
        },
        {
          optionId: 4,
          optionName: 'Fourth',
          firstPct: 0,
          skySupport: '0',
          transfer: '0',
          transferPct: 0,
          winner: false,
          eliminated: undefined
        },
        {
          optionId: 2,
          optionName: 'Second',
          skySupport: '0',
          transfer: '0',
          firstPct: 0,
          transferPct: 0,
          winner: false,
          eliminated: undefined
        },
        {
          optionId: 3,
          optionName: 'Third',
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

  it('gives expected results for tally with abstain majority', async () => {
    (gqlRequest as Mock)
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({
        pollVotes: []
      })
      .mockResolvedValueOnce({
        arbitrumPoll: {
          votes: [
            { voter: { id: '0x123' }, choice: '1' },
            { voter: { id: '0x456' }, choice: '1' },
            { voter: { id: '0x789' }, choice: '0' },
            { voter: { id: '0xabc' }, choice: '0' },
            { voter: { id: '0x1aa' }, choice: '1' },
            { voter: { id: '0x2bb' }, choice: '2' },
            { voter: { id: '0x3cc' }, choice: '0' }
          ]
        }
      })
      .mockResolvedValueOnce({
        voters: [
          { id: '0x123', v2VotingPowerChanges: [{ newBalance: '40000000000000000000' }] },
          { id: '0x456', v2VotingPowerChanges: [{ newBalance: '60000000000000000000' }] },
          { id: '0x789', v2VotingPowerChanges: [{ newBalance: '77000000000000000000' }] },
          { id: '0xabc', v2VotingPowerChanges: [{ newBalance: '32000000000000000000' }] },
          { id: '0x1aa', v2VotingPowerChanges: [{ newBalance: '600000000000000000000' }] },
          { id: '0x2bb', v2VotingPowerChanges: [{ newBalance: '32000000000000000000' }] },
          { id: '0x3cc', v2VotingPowerChanges: [{ newBalance: '1200000000000000000000' }] }
        ]
      });

    const result = await fetchPollTally(mockPoll, SupportedNetworks.MAINNET);

    const expectedResult = {
      parameters: mockPoll.parameters,
      winner: 1,
      winningOptionName: 'First',
      victoryConditionMatched: 0,
      totalSkyActiveParticipation: '732',
      totalSkyParticipation: '2041',
      numVoters: 7,
      results: [
        {
          optionId: 0,
          optionName: 'Abstain',
          firstPct: 64.1352,
          skySupport: '1309',
          transfer: '0',
          transferPct: 0,
          winner: false,
          eliminated: undefined
        },
        {
          optionId: 1,
          optionName: 'First',
          firstPct: 34.2969,
          skySupport: '700',
          transfer: '0',
          transferPct: 0,
          winner: true,
          eliminated: undefined
        },
        {
          optionId: 2,
          optionName: 'Second',
          firstPct: 1.5679,
          skySupport: '32',
          transfer: '0',
          transferPct: 0,
          winner: false,
          eliminated: undefined
        },
        {
          optionId: 4,
          optionName: 'Fourth',
          firstPct: 0,
          skySupport: '0',
          transfer: '0',
          transferPct: 0,
          winner: false,
          eliminated: undefined
        },
        {
          optionId: 3,
          optionName: 'Third',
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
