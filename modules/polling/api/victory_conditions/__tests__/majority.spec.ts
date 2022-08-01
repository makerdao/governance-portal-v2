import { ParsedSpockVote } from 'modules/polling/types/tallyVotes';
import { extractWinnerMajority } from '../majority';

describe('Majority calculation', () => {
  it('returns the option with more MKR', () => {
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

    const winner = extractWinnerMajority(votes, 0);

    expect(winner).toEqual(3);
  });

  it('returns null if we ask to be 50% of the votes', () => {
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
        mkrSupport: 25,
        optionIdRaw: 3,
        ballot: [3]
      }
    ];

    const winner = extractWinnerMajority(votes, 50);

    expect(winner).toEqual(null);
  });

  it('returns 1 if we ask to be 50% of the votes', () => {
    const votes: ParsedSpockVote[] = [
      {
        mkrSupport: 60,
        optionIdRaw: 1,
        ballot: [1]
      },
      {
        mkrSupport: 30,
        optionIdRaw: 2,
        ballot: [2]
      },
      {
        mkrSupport: 30,
        optionIdRaw: 3,
        ballot: [3]
      }
    ];

    const winner = extractWinnerMajority(votes, 50);

    expect(winner).toEqual(1);
  });

  it('works for ballots with multiple votes', () => {
    const votes: ParsedSpockVote[] = [
      {
        mkrSupport: 60,
        optionIdRaw: 1,
        ballot: [1, 2]
      },
      {
        mkrSupport: 35,
        optionIdRaw: 2,
        ballot: [3, 4]
      },
      {
        mkrSupport: 30,
        optionIdRaw: 3,
        ballot: [1, 3]
      }
    ];

    const winner = extractWinnerMajority(votes, 50);

    expect(winner).toEqual(1);
  });


});
