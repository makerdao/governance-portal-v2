import { gqlRequest } from 'modules/gql/gqlRequest';
import { allCurrentVotes } from 'modules/gql/queries/allCurrentVotes';
import { AllCurrentVotesQueryVariables } from 'modules/gql/types';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { parseRawOptionId } from '../helpers/parseRawOptionId';
import { PollTallyVote } from '../types';

export async function fetchAllCurrentVotes(
  address: string,
  network: SupportedNetworks,
  variables: AllCurrentVotesQueryVariables
): Promise<PollTallyVote[]> {
  const data = await gqlRequest({
    chainId: networkNameToChainId(network),
    query: allCurrentVotes,
    variables
  });

  // Parse the rankedChoice option
  const res: PollTallyVote[] = data.allCurrentVotes.edges.map(({ node: o, cursor }) => {
    const ballot = parseRawOptionId(o.optionIdRaw);
    return {
      ...o,
      ballot,
      voter: address,
      cursor
    };
  });

  return res;
}
