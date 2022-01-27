import { gqlRequest } from 'modules/gql/gqlRequest';
import { allCurrentVotes } from 'modules/gql/queries/allCurrentVotes';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { PollVote } from '../types';

export async function fetchAllCurrentVotes(address: string, network: SupportedNetworks): Promise<PollVote[]> {
  const data = await gqlRequest({
    chainId: networkNameToChainId(network),
    query: allCurrentVotes,
    variables: { argAddress: address }
  });

  const res: PollVote[] = data.allCurrentVotes.nodes;
  return res;
}
