import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';
import getMaker from 'lib/maker';
import voteProxyFactoryAbi from 'lib/abis/voteProxyAbi.json';
import { isSupportedNetwork } from 'lib/maker/index';
import { DEFAULT_NETWORK } from 'lib/constants';
import withApiHandler from 'lib/api/withApiHandler';
import { fetchDelegate } from 'modules/delegates/api/fetchDelegates';
import { AddressApiResponse } from 'modules/address/types/addressApiResponse';
import { fetchAddressPollVoteHistory } from 'modules/polls/api/fetchAddressPollVoteHistory';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse<AddressApiResponse>) => {
  const network = (req.query.network as string) || DEFAULT_NETWORK;
  const address = req.query.address as string;
  invariant(isSupportedNetwork(network), `unsupported network ${network}`);

  const maker = await getMaker();
  const voteProxy = maker.service('smartContract').getContractByAddressAndAbi(address, voteProxyFactoryAbi);

  // TODO: should we check cold for history?
  let hot;
  try {
    hot = await voteProxy.hot();
  } catch (err) {
    // console.log(err);
  }

  const delegate = await fetchDelegate(address, network);
  const pollVoteHistory = await fetchAddressPollVoteHistory(hot ? hot : address, network);

  const response: AddressApiResponse = {
    isDelegate: !!delegate,
    isProxyContract: !!hot,
    delegateInfo: delegate,
    address,
    stats: {
      pollVoteHistory
    }
  };

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.status(200).json(response);
});
