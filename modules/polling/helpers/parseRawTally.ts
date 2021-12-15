import BigNumber from 'bignumber.js';
import invariant from 'tiny-invariant';
import { Poll, PollTally, RawPollTally, PluralityResult, RankedChoiceResult } from '../types';
import { POLL_VOTE_TYPE } from '../polling.constants';

// Compliments the on-chain tally with a results object that is used on the front-end for data representation
export function parseRawPollTally(rawTally: RawPollTally, poll: Poll): PollTally {
  invariant(rawTally?.totalMkrParticipation, 'invalid or undefined raw tally');
  const totalMkrParticipation = new BigNumber(rawTally.totalMkrParticipation);

  const winningOptionName = rawTally?.winner === null ? 'None found' : poll.options[rawTally.winner];

  const rankedChoiceResult: RankedChoiceResult[] = Object.keys(poll.options)
    .map(key => {
      return {
        optionId: key,
        optionName: poll.options[key],
        firstChoice: new BigNumber(rawTally.options?.[key]?.firstChoice || 0),
        transfer: new BigNumber(rawTally.options?.[key]?.transfer || 0),
        firstPct:
          totalMkrParticipation.isGreaterThan(0) && rawTally.options?.[key]?.firstChoice
            ? new BigNumber(rawTally.options[key].firstChoice).div(totalMkrParticipation).times(100)
            : new BigNumber(0),
        transferPct:
          totalMkrParticipation.isGreaterThan(0) && rawTally.options?.[key]?.transfer
            ? new BigNumber(rawTally.options[key].transfer).div(totalMkrParticipation).times(100)
            : new BigNumber(0),
        eliminated: rawTally.options?.[key]?.eliminated ?? true,
        winner: rawTally.options?.[key]?.winner ?? false
      } as RankedChoiceResult;
    })
    .sort((a, b) => {
      const valueA = a.firstChoice.plus(a.transfer);
      const valueB = b.firstChoice.plus(b.transfer);
      if (valueA.eq(valueB)) return a.optionName > b.optionName ? 1 : -1;
      return valueA.gt(valueB) ? -1 : 1;
    });

  const pluralityResult: PluralityResult[] = Object.keys(poll.options)
    .map(key => {
      return {
        optionId: key,
        optionName: poll.options[key],
        mkrSupport: new BigNumber(rawTally.options?.[key]?.mkrSupport || 0),
        firstPct:
          totalMkrParticipation.isGreaterThan(0) && rawTally.options?.[key]?.mkrSupport
            ? new BigNumber(rawTally.options[key].mkrSupport).div(totalMkrParticipation).times(100)
            : new BigNumber(0),
        winner: rawTally.options?.[key]?.winner ?? false
      } as PluralityResult;
    })
    .sort((a, b) => {
      const valueA = a.mkrSupport;
      const valueB = b.mkrSupport;
      if (valueA.eq(valueB)) return a.optionName > b.optionName ? 1 : -1;
      return valueA.gt(valueB) ? -1 : 1;
    });

  // Now we have created the results object, we intentionally omit 'options' to avoid confusion
  const {
    options: _, // eslint-disable-line @typescript-eslint/no-unused-vars
    ...remainder
  } = rawTally;

  return {
    ...remainder,
    results: poll.voteType === POLL_VOTE_TYPE.PLURALITY_VOTE ? pluralityResult : rankedChoiceResult,
    totalMkrParticipation: totalMkrParticipation.toNumber(),
    winningOptionName
  } as PollTally;
}
