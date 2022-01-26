import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';
import { isSupportedNetwork } from 'modules/web3/helpers/networks';
import { fetchAddressPollVoteHistory } from 'modules/polling/api/fetchAddressPollVoteHistory';
import { PollVoteHistory } from 'modules/polling/types/pollVoteHistory';
import withApiHandler from 'modules/app/api/withApiHandler';
import { DEFAULT_NETWORK } from 'modules/web3/constants/networks';
import { resolveENS } from 'modules/web3/helpers/ens';
import { getContracts } from 'modules/web3/helpers/getContracts';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { getVoteProxyAddresses } from 'modules/app/helpers/getVoteProxyAddresses';

/*
  Returns the last vote for a given address
*/
export default withApiHandler(
  async (
    req: NextApiRequest,
    res: NextApiResponse<{
      lastVote: PollVoteHistory;
    }>
  ) => {
    const network = (req.query.network as string) || DEFAULT_NETWORK.network;
    const tempAddress = req.query.address as string;
    invariant(isSupportedNetwork(network), `unsupported network ${network}`);

    const address = tempAddress.indexOf('.eth') !== -1 ? await resolveENS(tempAddress) : tempAddress;

    const contracts = getContracts(networkNameToChainId(network));

    const voteProxyAddress = await getVoteProxyAddresses(
      contracts.voteProxyFactory,
      address as string,
      network
    );

    const pollVoteHistory = await fetchAddressPollVoteHistory(
      voteProxyAddress.hotAddress ? voteProxyAddress.hotAddress : (address as string),
      network
    );
    const lastVote = pollVoteHistory.sort((a, b) => (a.blockTimestamp > b.blockTimestamp ? -1 : 1))[0];

    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
    res.status(200).json({
      lastVote
    });
  }
);
