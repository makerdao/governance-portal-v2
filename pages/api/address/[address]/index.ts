import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';

import { isSupportedNetwork } from 'lib/maker/index';
import { DEFAULT_NETWORK } from 'lib/constants';
import withApiHandler from 'lib/api/withApiHandler';
import { fetchDelegate } from 'lib/delegates/fetchDelegates';
import { AddressApiResponse } from 'modules/address/types/addressApiResponse';
import { fetchAddressPollVoteHistory } from 'modules/polls/api/fetchAddressPollVoteHistory';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse<AddressApiResponse>) => {
  const network = (req.query.network as string) || DEFAULT_NETWORK;
  const address = req.query.address as string;
  invariant(isSupportedNetwork(network), `unsupported network ${network}`);

  const delegate = await fetchDelegate(address, network);
  const pollVoteHistory = await fetchAddressPollVoteHistory(address, network);
  
  const response : AddressApiResponse = {
    isDelegate: !!delegate,
    delegateInfo: delegate,
    address,
    stats: {
      pollVoteHistory
    }
  };

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.status(200).json(response);
});
