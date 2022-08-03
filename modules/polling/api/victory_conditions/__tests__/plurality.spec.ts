import { ParsedSpockVote } from 'modules/polling/types/tallyVotes';
import { extractWinnerPlurality } from '../plurality';

describe('Extract winner condition plurality', () => {
  it('gets the one with most mkr', async () => {
    const votes: ParsedSpockVote[] = [
      {
        mkrSupport: 10,
        optionIdRaw: 1,
        ballot: [1]
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

    const winner = extractWinnerPlurality(votes);

    expect(winner).toEqual(3);
  });
  it('doesnt find winner if two votes have the same MKR amount', async () => {
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

    const winner = extractWinnerPlurality(votes);

    expect(winner).toEqual(null);
  });
});
