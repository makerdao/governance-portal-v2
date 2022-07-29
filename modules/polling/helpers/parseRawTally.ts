import invariant from 'tiny-invariant';
import { Poll, PollTally, RawPollTally, PluralityResult, RankedChoiceResult } from '../types';
import BigNumber from 'lib/bigNumberJs';
import { hasVictoryConditionPlurality, hasVictoryConditionInstantRunOff, hasVictoryConditionApproval, hasVictoryConditionMajority } from './utils';

export function getRankedChoiceResults(rawTally: RawPollTally, poll: Poll): RankedChoiceResult[] {
  const rankedChoiceResult: RankedChoiceResult[] = Object.keys(poll.options)
    .map(key => {
      return {
        optionId: key,
        optionName: poll.options[key],
        firstChoice: rawTally.options?.[key]?.firstChoice?.toNumber() || 0,
        transfer: rawTally.options?.[key]?.transfer?.toNumber() || 0,
        firstPct:
          rawTally.totalMkrParticipation.gt(0) && rawTally.options?.[key]?.firstChoice
            ? new BigNumber(rawTally.options[key].firstChoice)
                .div(rawTally.totalMkrParticipation)
                .times(100)
                .toNumber()
            : 0,
        transferPct:
          rawTally.totalMkrParticipation.gt(0) && rawTally.options?.[key]?.transfer
            ? new BigNumber(rawTally.options[key].transfer)
                .div(rawTally.totalMkrParticipation)
                .times(100)
                .toNumber()
            : 0,
        eliminated: rawTally.options?.[key]?.eliminated ?? true,
        winner: rawTally.options?.[key]?.winner ?? false
      } as RankedChoiceResult;
    })
    .sort((a, b) => {
      const valueA = new BigNumber(a.firstChoice).plus(a.transfer);
      const valueB = new BigNumber(b.firstChoice).plus(b.transfer);
      if (valueA.eq(valueB)) return a.optionName > b.optionName ? 1 : -1;
      return valueA.gt(valueB) ? -1 : 1;
    });

  return rankedChoiceResult;
}

export function getPluralityResults(rawTally: RawPollTally, poll: Poll): PluralityResult[] {
  const pluralityResult: PluralityResult[] = Object.keys(poll.options)
    .map(key => {
      const result: PluralityResult = {
        optionId: key,
        optionName: poll.options[key],
        mkrSupport: rawTally.options?.[key]?.mkrSupport?.toNumber() || 0,
        firstPct:
          rawTally.totalMkrParticipation.gt(0) && rawTally.options?.[key]?.mkrSupport
            ? new BigNumber(rawTally.options[key].mkrSupport)
                .div(rawTally.totalMkrParticipation)
                .times(100)
                .toNumber()
            : 0,
        winner: rawTally.options?.[key]?.winner ?? false
      };

      return result;
    })
    .sort((a, b) => {
      const valueA = new BigNumber(a.mkrSupport);
      const valueB = new BigNumber(b.mkrSupport);
      if (valueA.eq(valueB)) return a.optionName > b.optionName ? 1 : -1;
      return valueA.gt(valueB) ? -1 : 1;
    });

  return pluralityResult;
}

// Compliments the on-chain tally with a results object that is used on the front-end for data representation
export function parseRawPollTally(rawTally: RawPollTally, poll: Poll): PollTally {
  invariant(rawTally?.totalMkrParticipation, 'invalid or undefined raw tally');

  const winningOptionName = rawTally?.winner === null ? 'None found' : poll.options[rawTally.winner];

  // Now we have created the results object, we intentionally omit 'options' to avoid confusion
  const {
    options: _, // eslint-disable-line @typescript-eslint/no-unused-vars
    ...remainder
  } = rawTally;

  const totalMkrParticipation = rawTally.totalMkrParticipation.toNumber();

  const isRanked = hasVictoryConditionInstantRunOff(poll.parameters.victoryConditions);

  const isPlurality = hasVictoryConditionPlurality(poll.parameters.victoryConditions);

  const isApproval = hasVictoryConditionApproval(poll.parameters.victoryConditions);

  const isMajority = hasVictoryConditionMajority(poll.parameters.victoryConditions);


  // Select the logic to format the results based on the victory condition
  if (isRanked) {
    return {
      ...remainder,
      results: getRankedChoiceResults(rawTally, poll),
      totalMkrParticipation,
      winningOptionName
    } as PollTally;
  } else if (isPlurality) {
    return {
      ...remainder,
      results: getPluralityResults(rawTally, poll),
      totalMkrParticipation,
      winningOptionName
    } as PollTally;
  } else {
    throw new Error('Victory condition not supported');
  }
}
