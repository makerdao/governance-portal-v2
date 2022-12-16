import { gqlRequest } from 'modules/gql/gqlRequest';
import { latestVotes } from 'modules/gql/queries/latestVotes';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { parseRawOptionId } from '../helpers/parseRawOptionId';
import { PollTallyVote } from '../types';

export async function fetchLatestVotes(
  network: SupportedNetworks,
  start = 0,
  limit = 10
): Promise<PollTallyVote[]> {
  const data = await gqlRequest({
    chainId: networkNameToChainId(network),
    query: latestVotes,
    variables: { first: limit, offset : start }
  });

  // Parse the rankedChoice option
  const res: PollTallyVote[] = data.allCurrentVotes.nodes.map(o => {
    const ballot = parseRawOptionId(o.optionIdRaw);
    return {
      ...o,
      ballot,
      voter: o.address
    };
  });

  return res;
}
