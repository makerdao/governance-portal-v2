import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';
import { isSupportedNetwork } from 'lib/maker/index';
import { DEFAULT_NETWORK } from 'lib/constants';
import withApiHandler from 'lib/api/withApiHandler';
import { AddressApiResponse } from 'modules/address/types/addressApiResponse';
import { resolveENS } from 'modules/web3/ens';
import { getAddressInfo } from 'modules/address/api/getAddressInfo';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse<AddressApiResponse>) => {
  const network = (req.query.network as string) || DEFAULT_NETWORK;
  const tempAddress = req.query.address as string;
  invariant(isSupportedNetwork(network), `unsupported network ${network}`);

  const address = tempAddress.indexOf('.eth') !== -1 ? await resolveENS(tempAddress) : tempAddress;
  const response = await getAddressInfo(address, network);

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.status(200).json(response);
});
