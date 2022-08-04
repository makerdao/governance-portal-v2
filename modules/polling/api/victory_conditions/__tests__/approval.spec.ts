import { ParsedSpockVote } from 'modules/polling/types/tallyVotes';
import { extractWinnerApproval } from '../approval';

describe('Extract winner condition approval', () => {
  it('gets the one with most mkr', async () => {
    const votes: ParsedSpockVote[] = [
      {
        mkrSupport: 15,
        optionIdRaw: 1,
        ballot: [1, 2]
      },
      {
        mkrSupport: 20,
        optionIdRaw: 2,
        ballot: [2]
      },
      {
        mkrSupport: 30,
        optionIdRaw: 3,
        ballot: [3]
      }
    ];

    const winner = extractWinnerApproval(votes);

    expect(winner).toEqual(2);
  });
  it('gets first winner if two votes have the same MKR amount', async () => {
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

    expect(winner).toEqual(1);
  });
});
