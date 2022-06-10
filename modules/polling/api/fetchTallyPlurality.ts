import BigNumber from 'bignumber.js';
import { gqlRequest } from 'modules/gql/gqlRequest';
import { voteMkrWeightsAtTimeRankedChoice } from 'modules/gql/queries/voteMkrWeightsAtTimeRankedChoice';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { RawPollTallyPlurality } from '../types';
import { fetchSpockPollById } from './fetchPollBy';

export async function fetchTallyPlurality(
  pollId: number,
  network: SupportedNetworks
): Promise<RawPollTallyPlurality | null> {
  const poll = await fetchSpockPollById(pollId, network);

  if (!poll) {
    return null;
  }

  const data = await gqlRequest({
    chainId: networkNameToChainId(network),
    query: voteMkrWeightsAtTimeRankedChoice,
    variables: {
      argPollId: pollId,
      argUnix: poll.endDate
    }
  });

  const currentVotes: { optionIdRaw: number; mkrSupport: number }[] =
    data.voteMkrWeightsAtTimeRankedChoice.nodes;
  const numVoters = currentVotes.length;

  const resultsObject = currentVotes.reduce((acc, cur) => {
    if (acc[cur.optionIdRaw]) {
      acc[cur.optionIdRaw] = acc[cur.optionIdRaw].plus(cur.mkrSupport);
    } else {
      acc[cur.optionIdRaw] = new BigNumber(cur.mkrSupport);
    }
    return acc;
  }, {});

  const summedSupport = Object.keys(resultsObject).map(option => ({
    optionId: option,
    mkrSupport: resultsObject[option] as BigNumber
  }));

  const sorted = summedSupport.sort((prev, next) => (prev.mkrSupport.gt(next.mkrSupport) ? -1 : 1));

  const winner =
    // first check if abstain is only option in sorted
    // if so, then no winner, return null
    sorted.length === 1 && sorted[0].optionId === '0'
      ? null
      : // otherwise the winner is the first option, unless the first option is "0" which is abstain
      // in that case we pick the next option
      sorted.length > 0
      ? sorted[0].optionId !== '0'
        ? sorted[0].optionId.toString()
        : sorted[1].optionId.toString()
      : null;

  const totalMkrParticipation = summedSupport.reduce(
    (acc, cur) => cur.mkrSupport.plus(acc),
    new BigNumber(0)
  );

  const options = summedSupport.reduce((a, v) => {
    a[v.optionId] = {
      mkrSupport: v.mkrSupport,
      winner: v.optionId === winner
    };
    return a;
  }, {});

  return {
    winner,
    totalMkrParticipation,
    numVoters,
    options
  };
}
