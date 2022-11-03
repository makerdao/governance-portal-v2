import { fromBuffer } from 'lib/utils';
import { ParsedSpockVote } from 'modules/polling/types/tallyVotes';
import { extractWinnerApproval } from '../approval';
import { extractWinnerApprovalPriority } from '../approvalPriority';

describe('Extract winner condition approval priority', () => {
  it('gets the one with most mkr', async () => {
    const votes: ParsedSpockVote[] = [
        {
            mkrSupport: '29361.000000000000000',
            ballot: [1,3,2,8],
            // A C B H
            optionIdRaw: fromBuffer([1,3,2,8].reverse(), null).toString() // [1st choice, 2nd choice, ...]
          },
          {
            mkrSupport: '73796.0',
            ballot: [2,4,1,3,8],
            // B D A C H
            optionIdRaw: fromBuffer([2,4,1,3,8].reverse(), null).toString()
          },
          {
            mkrSupport: '71255',
            ballot: [2,1,3,7],
            // B A C G
            optionIdRaw: fromBuffer([2,1,3,7].reverse(), null).toString()
          },
          {
            mkrSupport: '16943',
            ballot: [3,4,5,7, 6, 1],
            // C D E G F A
            optionIdRaw: fromBuffer([3,4,5,7, 6, 1].reverse(), null).toString()
          },
          {
            mkrSupport: '29823',
            ballot: [3,2,1],
            // C B A
            optionIdRaw: fromBuffer([3,2,1].reverse(), null).toString()
          },
          {
            mkrSupport: '29699',
            ballot: [3,4, 5, 6, 7 ,1],
            // C D E F G A
            optionIdRaw: fromBuffer([3,4, 5, 6, 7 ,1].reverse(), null).toString()
          },
          {
            mkrSupport: '3035',
            ballot: [4, 5, 1, 6],
            // D E A F
            optionIdRaw: fromBuffer([4, 5, 1, 6].reverse(), null).toString()
          },
          {
            mkrSupport: '929',
            ballot: [4, 5, 1, 2, 6],
            // D E A B F
            optionIdRaw: fromBuffer([4, 5, 1, 2, 6].reverse(), null).toString()
          },
          {
            mkrSupport: '2374',
            ballot: [4, 1, 2],
            // D A B
            optionIdRaw: fromBuffer([4, 1, 2].reverse(), null).toString()
          },
          {
            mkrSupport: '11234',
            ballot: [3, 1, 5, 7],
            // C A E G
            optionIdRaw: fromBuffer([3, 1, 5, 7].reverse(), null).toString()
          },
          {
            mkrSupport: '6123',
            ballot: [3, 2, 4, 1, 7],
            // C B D A G
            optionIdRaw: fromBuffer([3, 2, 4, 1, 7].reverse(), null).toString()
          },
          {
            mkrSupport: '18636',
            ballot: [3, 1, 4, 5, 8],
            // C A D E H
            optionIdRaw: fromBuffer([3, 1, 4, 5, 8].reverse(), null).toString()
          }

    ];

    const winner = extractWinnerApprovalPriority(votes, 8);

    console.log(JSON.stringify(winner, null, 2))

    expect(winner).toEqual(2);
  });
  it('finds no winner if two votes have the same MKR amount', async () => {
    const votes: ParsedSpockVote[] = [
      {
        mkrSupport: 10,
        optionIdRaw: 1,
        ballot: [1]
      },
      {
        mkrSupport: 10,
        optionIdRaw: 2,
        ballot: [2]
      }
    ];

    const winner = extractWinnerApproval(votes);

    expect(winner).toEqual(null);
  });
});
