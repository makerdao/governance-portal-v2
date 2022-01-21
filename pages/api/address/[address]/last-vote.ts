import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';
import getMaker from 'lib/maker';
import voteProxyFactoryAbi from 'lib/abis/voteProxyAbi.json';
import { isSupportedNetwork } from 'lib/maker/index';
import { fetchAddressPollVoteHistory } from 'modules/polling/api/fetchAddressPollVoteHistory';
import { PollVoteHistory } from 'modules/polling/types/pollVoteHistory';
import withApiHandler from 'modules/app/api/withApiHandler';
import { DEFAULT_NETWORK } from 'modules/web3/constants/networks';
import { resolveENS } from 'modules/web3/helpers/ens';

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
    const maker = await getMaker(network);
    const voteProxyContract = maker
      .service('smartContract')
      .getContractByAddressAndAbi(address, voteProxyFactoryAbi);

    // TODO: should we check cold for history?
    let hot;
    try {
      hot = await voteProxyContract.hot();
    } catch (err) {
      // console.log(err);
    }

    const pollVoteHistory = await fetchAddressPollVoteHistory(hot ? hot : address, network);
    const lastVote = pollVoteHistory.sort((a, b) => (a.blockTimestamp > b.blockTimestamp ? -1 : 1))[0];

    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
    res.status(200).json({
      lastVote
    });
  }
);
