// Receives the currentVotes and the percentage required to be determined winner
import { ParsedSpockVote } from 'modules/polling/types/tallyVotes';
import BigNumber from 'lib/bigNumberJs';

// Determines the winner of a majority algorithm. The percent is a number between 0-100 and it determines that the winner has to have more than "percent" of the MKR.
export function extractWinnerMajority(currentVotes: ParsedSpockVote[], percent: number): number | null {
  // Group votes by MKR support, remember that each vote has a ballot with possible many multiple options
  const votes: { [key: number]: BigNumber } = {};
  let totalMKR = new BigNumber(0);

  currentVotes.forEach(vote => {
    totalMKR = totalMKR.plus(vote.mkrSupport);

    vote.ballot.forEach(votedOption => {
      if (votes[votedOption]) {
        votes[votedOption] = votes[votedOption].plus(vote.mkrSupport);
      } else {
        votes[votedOption] = new BigNumber(vote.mkrSupport);
      }
    });
  });

  // Sort options by MKR support
  const sortedOptions = Object.keys(votes)
    .map(option => {
      return {
        option: parseInt(option),
        mkrSupport: votes[parseInt(option)]
      };
    })
    .sort((prev, next) => {
      return prev.mkrSupport.isGreaterThanOrEqualTo(next.mkrSupport) ? -1 : 1;
    });

  const mostVoted = sortedOptions[0];

  // Check percentage of majority
  if (mostVoted.mkrSupport.div(totalMKR).isGreaterThanOrEqualTo(percent > 0 ? percent / 100 : 0)) {
    return mostVoted.option;
  }

  // Does not pass majority
  return null;
}
