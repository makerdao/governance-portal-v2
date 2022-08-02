import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';
import { BaseProvider } from '@ethersproject/providers';

import { isSupportedNetwork } from 'modules/web3/helpers/networks';

import { fetchDelegates } from 'modules/delegates/api/fetchDelegates';
import { DelegatesAPIResponse } from 'modules/delegates/types';
import { DEFAULT_NETWORK } from 'modules/web3/constants/networks';
import withApiHandler from 'modules/app/api/withApiHandler';

export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse<DelegatesAPIResponse>, provider: BaseProvider) => {
    const network = (req.query.network as string) || DEFAULT_NETWORK.network;
    const sortBy = req.query.sortBy ? req.query.sortBy : 'random';

    invariant(isSupportedNetwork(network), `unsupported network ${network}`);
    const delegates = await fetchDelegates(provider, network, sortBy as any);

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json(delegates);
  }
);
