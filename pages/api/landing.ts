import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';
import { isSupportedNetwork } from 'modules/web3/helpers/networks';
import { DEFAULT_NETWORK } from 'modules/web3/constants/networks';
import withApiHandler from 'modules/app/api/withApiHandler';
import { fetchLandingPageData, LandingPageData } from 'modules/home/api/fetchLandingPageData';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse<LandingPageData>) => {
  const network = (req.query.network as string) || DEFAULT_NETWORK.network;
  invariant(isSupportedNetwork(network), `unsupported network ${network}`);

  const data = await fetchLandingPageData(network, true);

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.status(200).json(data);
});
