import { NextApiRequest, NextApiResponse } from 'next';
// import { ethers } from 'ethers';

// import { getConnectedMakerObj } from '../../../_lib/utils';
import { createPollTallyRoute } from '../[poll-id]';
import { isSupportedNetwork } from '../../../../../lib/maker';
import { DEFAULT_NETWORK } from '../../../../../lib/constants';
import invariant from 'tiny-invariant';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const pollId = req.query['poll-id'] as string;
  invariant(pollId, 'poll id required');

  const network = (req.query.network as string) || DEFAULT_NETWORK;
  invariant(isSupportedNetwork(network), `Unsupported network ${network}`);

  // const provider = ethers.getDefaultProvider(network);
  // const maker = await getConnectedMakerObj(network);

  // const [{ transactionHash, blockNumber }] = await provider.getLogs({
  //   address: ,
  //   fromBlock: 0,
  //   toBlock: 'latest',
  //   topics: []
  // });

  // verify that the poll has ended before perma-caching it

  return createPollTallyRoute({ cacheType: 'max-age=0, s-maxage=31536000' })(req, res);
};
