import { SupportedNetworks } from 'lib/constants';
import getMaker from 'lib/maker';
import { RawPollTally } from '../types';

export async function fetchPollTally(pollId: number, network?: SupportedNetworks): Promise<RawPollTally> {
  const maker = await getMaker(network);
  
  return maker.service('govPolling').getTallyRankedChoiceIrv(pollId);
}