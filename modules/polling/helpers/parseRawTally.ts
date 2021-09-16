import { MKR } from 'lib/maker';
import BigNumber from 'bignumber.js';
import invariant from 'tiny-invariant';
import { Poll, PollTally, RawPollTally } from '../types';


// Compliments the on-chain tally with a results object that is used on the front-end for data representation
export function parseRawPollTally(rawTally: RawPollTally, poll: Poll): PollTally {
  invariant(rawTally?.totalMkrParticipation, 'invalid or undefined raw tally');
  const totalMkrParticipation = MKR(rawTally.totalMkrParticipation);
  
  const winningOptionName = rawTally?.winner === null ? 'None found' :  poll.options[rawTally.winner];

 
  const results = Object.keys(poll.options)
    .map(key => {
      return {
        optionId: key,
        optionName: poll.options[key],
        firstChoice: new BigNumber(rawTally.options?.[key]?.firstChoice || 0),
        transfer: new BigNumber(rawTally.options?.[key]?.transfer || 0),
        firstPct: rawTally.options?.[key]?.firstChoice
          ? new BigNumber(rawTally.options[key].firstChoice)
              .div(totalMkrParticipation.toBigNumber())
              .times(100)
          : new BigNumber(0),
        transferPct: rawTally.options?.[key]?.transfer
          ? new BigNumber(rawTally.options[key].transfer).div(totalMkrParticipation.toBigNumber()).times(100)
          : new BigNumber(0),
        eliminated: rawTally.options?.[key]?.eliminated ?? true,
        winner: rawTally.options?.[key]?.winner ?? false
      };
    })
    .sort((a, b) => {
      const valueA = a.firstChoice.plus(a.transfer);
      const valueB = b.firstChoice.plus(b.transfer);
      if (valueA.eq(valueB)) return a.optionName > b.optionName ? 1 : -1;
      return valueA.gt(valueB) ? -1 : 1;
    });

  return { 
    ...rawTally, 
    results, 
    totalMkrParticipation, 
    winningOptionName
   };
}
