import { gqlRequest } from 'modules/gql/gqlRequest';
import { allCurrentVotes } from 'modules/gql/queries/allCurrentVotes';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { parseRankedChoiceRawOptionId } from '../helpers/parseRankedChoiceRawOptionId';
import { PollVote } from '../types';

export async function fetchAllCurrentVotes(address: string, network: SupportedNetworks): Promise<PollVote[]> {
  const data = await gqlRequest({
    chainId: networkNameToChainId(network),
    query: allCurrentVotes,
    variables: { argAddress: address.toLowerCase() }
  });

  // Parse the rankedChoice option
  const res: PollVote[] = data.allCurrentVotes.nodes.map(o => {
    const rankedChoiceOption = parseRankedChoiceRawOptionId(o.optionIdRaw);
    return {
      ...o,
      rankedChoiceOption
    };
  });

  console.log('^^^fetchallvotes response', res);

  return res;
}
