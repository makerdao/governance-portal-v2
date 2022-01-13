import BigNumber from 'bignumber.js';
import { SupportedNetworks } from 'modules/web3/web3.constants';
import getMaker, { getNetwork } from 'lib/maker';
import { PollTallyVote } from '../types';

export async function fetchVotesByAddresForPoll(
  pollId: number,
  network?: SupportedNetworks
): Promise<PollTallyVote[]> {
  const currentNetwork = network || getNetwork();

  const maker = await getMaker(currentNetwork);

  return (await maker.service('govPolling').getMkrAmtVotedByAddress(pollId)).sort((a, b) =>
    new BigNumber(a.mkrSupport).lt(new BigNumber(b.mkrSupport)) ? 1 : -1
  );
}
