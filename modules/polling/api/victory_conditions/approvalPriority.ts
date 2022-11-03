import { ParsedSpockVote } from 'modules/polling/types/tallyVotes';
import BigNumber from 'lib/bigNumberJs';
import { ApprovalPriorityOptions, ApprovalPriorityResults } from 'modules/polling/types/approvalPriority';

export function extractWinnerApprovalPriority(
  currentVotes: ParsedSpockVote[]
): ApprovalPriorityResults | null {
  if (currentVotes.length === 0) {
    return null;
  }

  // Each ranking position has a weight that is calculated using a normalised harmonic progression
  const optionsWeights = [1, 0.5, 0.3333333333, 0.25, 0.2, 0.1666666667, 0.1428571429, 0.125];

  const votes: ApprovalPriorityOptions = {};

  currentVotes.forEach(vote => {
    vote.ballot.forEach((votedOption, index) => {
      const optionWeight = optionsWeights[index];
      const mkrWeighted = new BigNumber(vote.mkrSupport).multipliedBy(optionWeight);
      // The Priority Score of each option equals the aggregate of the MKR Weight of each voter multiplied by the weight of the position in which they ranked the option.

      if (votes[votedOption]) {
        votes[votedOption].mkrSupport = votes[votedOption].mkrSupport.plus(vote.mkrSupport);
        votes[votedOption].priorityScore = votes[votedOption].priorityScore.plus(mkrWeighted);
      } else {
        votes[votedOption] = {
          mkrSupport: new BigNumber(vote.mkrSupport),
          approvalPercentage: new BigNumber(0),
          priorityScore: mkrWeighted,
          priorityScoreNumber: 0
        };
      }
    });
  });

  // Calculate approval percentage
  // Approval percentage is calculated based on the MKR Support
  // Sort options by MKR support
  const sortedOptionsByMkrSupport = Object.keys(votes)
    .map(option => {
      return {
        option: parseInt(option),
        mkrSupport: votes[parseInt(option)].mkrSupport
      };
    })
    .sort((prev, next) => {
      return prev.mkrSupport.isGreaterThan(next.mkrSupport) ? -1 : 1;
    });

  // The approval percentage is 1 (100%) for the first option, and for the rest is calculated divided by the first option
  sortedOptionsByMkrSupport.forEach((option, index) => {
    const isWinner = index === 0;
    const isGreaterThanZero = option.mkrSupport.isGreaterThan(0);
    if (isWinner) {
      votes[option.option].approvalPercentage = new BigNumber(1);
    } else {
      if (isGreaterThanZero) {
        votes[option.option].approvalPercentage = option.mkrSupport.dividedBy(
          sortedOptionsByMkrSupport[0].mkrSupport
        );
      } else {
        votes[option.option].approvalPercentage = new BigNumber(0);
      }
    }
  });

  // Calculate now priority percentage

  // if the 2 first options share the same MKR amount, return null
  if (sortedOptions.length >= 2) {
    if (sortedOptions[0].mkrSupport.isEqualTo(sortedOptions[1].mkrSupport)) {
      return null;
    }
  }

  const winner = sortedOptions.length > 0 ? sortedOptions[0].option : null;
  return winner;
}
