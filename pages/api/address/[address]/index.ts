import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';
import getMaker from 'lib/maker';
import voteProxyFactoryAbi from 'lib/abis/voteProxyAbi.json';
import { isSupportedNetwork } from 'lib/maker/index';
import { DEFAULT_NETWORK } from 'lib/constants';
import withApiHandler from 'lib/api/withApiHandler';
import { fetchDelegate } from 'modules/delegates/api/fetchDelegates';
import { AddressApiResponse } from 'modules/address/types/addressApiResponse';
import { fetchAddressPollVoteHistory } from 'modules/polling/api/fetchAddressPollVoteHistory';
import { resolveENS } from 'modules/web3/ens';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse<AddressApiResponse>) => {
  const network = (req.query.network as string) || DEFAULT_NETWORK;
  const tempAddress = req.query.address as string;
  invariant(isSupportedNetwork(network), `unsupported network ${network}`);

  const address = tempAddress.indexOf('.eth') !== -1 ? await resolveENS(tempAddress) : tempAddress;
  const maker = await getMaker(network);
  const voteProxyContract = maker
    .service('smartContract')
    .getContractByAddressAndAbi(address, voteProxyFactoryAbi);

  // TODO: should we check cold for history?
  let hot;
  let cold;
  let voteProxyAddress;
  try {
    hot = await voteProxyContract.hot();
    cold = await voteProxyContract.cold();
    voteProxyAddress = address;
  } catch (err) {
    // console.log(err);
  }

  const voteProxyInfo =
    hot && cold && voteProxyAddress
      ? {
          voteProxyAddress,
          hot,
          cold
        }
      : undefined;

  const delegate = await fetchDelegate(address, network);
  const pollVoteHistory = await fetchAddressPollVoteHistory(hot ? hot : address, network);

  const response: AddressApiResponse = {
    isDelegate: !!delegate,
    isProxyContract: !!hot,
    voteProxyInfo,
    delegateInfo: delegate,
    address,
    stats: {
      pollVoteHistory,
      lastVote: pollVoteHistory.sort((a, b) => (a.blockTimestamp > b.blockTimestamp ? -1 : 1))[0] 
    }
  };

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.status(200).json(response);
});
