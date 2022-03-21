import { gqlRequest } from 'modules/gql/gqlRequest';
import { lastPollVote } from 'modules/gql/queries/lastPollVote';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { parseRawOptinIdRankedChoiceOption } from '../helpers/parseRawOptionIdRankedChoiceOption';
import { PollVote } from '../types';

export async function fetchLastPollVote(
  address: string,
  network: SupportedNetworks
): Promise<PollVote | null> {
  const data = await gqlRequest({
    chainId: networkNameToChainId(network),
    query: lastPollVote,
    variables: { argAddress: address.toLowerCase() }
  });

  // Parse the rankedChoice option
  const res: PollVote[] = data.allCurrentVotes.nodes.map(o => {
    const rankedChoiceOption = parseRawOptinIdRankedChoiceOption(o.optionIdRaw);
    return {
      ...o,
      rankedChoiceOption
    };
  });

  return res.length > 0 ? res[0] : null;
}
