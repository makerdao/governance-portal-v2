/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { PollInputFormat, PollResultDisplay, PollVictoryConditions } from 'modules/polling/polling.constants';
import { Poll } from 'modules/polling/types';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { gqlRequest } from '../../../../modules/gql/gqlRequest';
import { fetchPollTally } from '../fetchPollTally';
jest.mock('modules/gql/gqlRequest');

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
    (gqlRequest as jest.Mock).mockResolvedValueOnce({
      voteAddressMkrWeightsAtTime: {
        nodes: [
          {
            optionIdRaw: '258',
            mkrSupport: '820.2125800'
          },
          {
            optionIdRaw: '258',
            mkrSupport: '17.3630'
          },
          {
            optionIdRaw: '1',
            mkrSupport: '10'
          },
          {
            optionIdRaw: '4',
            mkrSupport: '14'
          },
          {
            optionIdRaw: '4',
            mkrSupport: '0'
          }
        ]
      }
    });

    const result = await fetchPollTally(mockPoll, SupportedNetworks.MAINNET);

    const expectedResult = {
      parameters: mockPoll.parameters,
      winner: 1,
      winningOptionName: 'Approve Existing Budget',
      totalMkrParticipation: '861.57558',
      totalMkrActiveParticipation: '861.57558',
      numVoters: 5,
      victoryConditionMatched: 0,
      results: [
        {
          optionId: 1,
          optionName: 'Approve Existing Budget',
          mkrSupport: '847.57558',
          firstPct: 98.37507000836769,
          transferPct: 0,
          winner: true
        },
        {
          optionId: 2,
          optionName: 'Approve Increase',
          mkrSupport: '837.57558',
          firstPct: 97.21440572863033,
          transferPct: 0,
          winner: false
        },
        {
          optionId: 4,
          optionName: 'None of the above',
          firstPct: 1.624929991632307,
          mkrSupport: '14',
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
        },
        {
          optionId: 3,
          optionName: 'Reject',
          firstPct: 0,
          mkrSupport: '0',
          transferPct: 0,
          winner: false
        }
      ]
    };

    expect(result).toEqual(expect.objectContaining(expectedResult));
  });

  it('gives no option as winner if both have the same MKR voting weight', async () => {
    (gqlRequest as jest.Mock).mockResolvedValueOnce({
      voteAddressMkrWeightsAtTime: {
        nodes: [
          {
            optionIdRaw: '258',
            mkrSupport: '820.2125800'
          },
          {
            optionIdRaw: '258',
            mkrSupport: '17.3630'
          },
          {
            optionIdRaw: '4',
            mkrSupport: '14'
          },
          {
            optionIdRaw: '4',
            mkrSupport: '0'
          }
        ]
      }
    });

    const result = await fetchPollTally(mockPoll, SupportedNetworks.MAINNET);

    const expectedResult = {
      parameters: mockPoll.parameters,
      winner: null,
      winningOptionName: 'None found',
      totalMkrParticipation: '851.57558',
      totalMkrActiveParticipation: '851.57558',
      numVoters: 4,
      victoryConditionMatched: null,
      results: [
        {
          optionId: 1,
          optionName: 'Approve Existing Budget',
          mkrSupport: '837.57558',
          firstPct: 98.35598855476809,
          transferPct: 0,
          winner: false
        },
        {
          optionId: 2,
          optionName: 'Approve Increase',
          mkrSupport: '837.57558',
          firstPct: 98.35598855476809,
          transferPct: 0,
          winner: false
        },
        {
          optionId: 4,
          optionName: 'None of the above',
          firstPct: 1.6440114452319077,
          mkrSupport: '14',
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
        },
        {
          optionId: 3,
          optionName: 'Reject',
          firstPct: 0,
          mkrSupport: '0',
          transferPct: 0,
          winner: false
        }
      ]
    };

    expect(result).toEqual(expect.objectContaining(expectedResult));
  });

  it('Ignores abstain', async () => {
    (gqlRequest as jest.Mock).mockResolvedValueOnce({
      voteAddressMkrWeightsAtTime: {
        nodes: [
          {
            optionIdRaw: '0',
            mkrSupport: '400'
          }
        ]
      }
    });

    const result = await fetchPollTally(mockPoll, SupportedNetworks.MAINNET);

    const expectedResult = {
      parameters: mockPoll.parameters,
      winner: null,
      winningOptionName: 'None found',
      totalMkrParticipation: '400',
      totalMkrActiveParticipation: '0',
      numVoters: 1,
      victoryConditionMatched: null,
      results: [
        {
          optionId: 0,
          optionName: 'Abstain',
          mkrSupport: '400',
          firstPct: 100,
          transferPct: 0,
          winner: false
        },
        {
          optionId: 1,
          optionName: 'Approve Existing Budget',
          mkrSupport: '0',
          firstPct: 0,
          transferPct: 0,
          winner: false
        },
        {
          optionId: 2,
          optionName: 'Approve Increase',
          mkrSupport: '0',
          firstPct: 0,
          transferPct: 0,
          winner: false
        },
        {
          optionId: 4,
          optionName: 'None of the above',
          firstPct: 0,
          mkrSupport: '0',
          transferPct: 0,
          winner: false
        },

        {
          optionId: 3,
          optionName: 'Reject',
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
