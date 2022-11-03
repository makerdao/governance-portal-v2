import { ParsedSpockVote } from 'modules/polling/types/tallyVotes';
import BigNumber from 'lib/bigNumberJs';
import { ApprovalPriorityOptions, ApprovalPriorityResults } from 'modules/polling/types/approvalPriority';

export function extractWinnerApprovalPriority(
  currentVotes: ParsedSpockVote[],
  maxOptions: number
): ApprovalPriorityResults | null {
  if (currentVotes.length === 0) {
    return null;
  }

  // Each ranking position has a weight that is calculated using a normalised harmonic progression
  const optionsWeights = [1, 0.5, 0.3333333333, 0.25, 0.2, 0.1666666667, 0.1428571429, 0.125];

  // Weight sum is the sum of all the weights for the amount of options
  let weightSum = 0;

  for (let i = 0; i < maxOptions; i++) {
    weightSum += optionsWeights[i];
  }

  // Normalized harmonic weights is the weight divided by the weight sum
  const normalizedOptionWeights = optionsWeights.map(i => i / weightSum);

  const votes: ApprovalPriorityOptions = {};

  let totalMKR = new BigNumber(0);

  currentVotes.forEach(vote => {
    vote.ballot.forEach((votedOption, index) => {
      // The Priority Score of each option equals the aggregate of the MKR Weight of each voter multiplied by the weight of the position in which they ranked the option.
      const optionWeight = normalizedOptionWeights[index];
      const priorityScore = new BigNumber(vote.mkrSupport).multipliedBy(optionWeight);

      // Increase total MRK count
      totalMKR = totalMKR.plus(vote.mkrSupport);

      // If voted option exists, increase it's mkrSupport and priorityScore
      if (votes[votedOption]) {
        votes[votedOption].mkrSupport = votes[votedOption].mkrSupport.plus(vote.mkrSupport);
        votes[votedOption].priorityScore = votes[votedOption].priorityScore.plus(priorityScore);
      } else {
        // If voted option does not exist, initialize it
        votes[votedOption] = {
          mkrSupport: new BigNumber(vote.mkrSupport),
          approvalPercentage: new BigNumber(0),
          priorityScore: priorityScore,
          priorityScorePercentage: new BigNumber(0)
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

  // Calculate now priority percentage. The priority percentage is calculated with the formula : PRIORITY_PERCENTAGE = PRIORITY_SCORE_OPTION * WEIGHT_SUM / TOTAL_MKR
  sortedOptionsByMkrSupport.forEach(option => {
    votes[option.option].priorityScorePercentage = votes[option.option].priorityScore
      .multipliedBy(weightSum)
      .dividedBy(totalMKR);
  });

  // If there is no option with approvalPercentage equal to 100% return null winner
  if (sortedOptionsByMkrSupport.length === 0) {
    return null;
  }

  return {
    winner: sortedOptionsByMkrSupport[0].option,
    options: votes
  };
}
