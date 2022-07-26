import { SupportedNetworks } from 'modules/web3/constants/networks';
import { PollParameters, RawPollTally } from 'modules/polling/types';
import { fetchTallyPlurality } from './fetchTallyPlurality';
import { fetchTallyRankedChoice } from './fetchTallyRankedChoice';
import { hasVictoryConditionPlurality } from '../helpers/utils';

export async function fetchRawPollTally(
  pollId: number,
  parameters: PollParameters,
  network: SupportedNetworks
): Promise<RawPollTally> {
  let tally;
  // TODO: Include majority victory conditions calculations
  // const isRanked = parameters.victoryConditions.find(v => v.type === PollVictoryConditions.instantRunoff);
  const isPlurality = hasVictoryConditionPlurality(parameters.victoryConditions);
  if (isPlurality) {
    tally = await fetchTallyPlurality(pollId, network);
  } else {
    tally = await fetchTallyRankedChoice(pollId, network);
  }

  return tally;
}
