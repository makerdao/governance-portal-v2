import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';
import { isSupportedNetwork } from 'lib/maker/index';
import { DEFAULT_NETWORK } from 'modules/web3/web3.constants';
import withApiHandler from 'lib/api/withApiHandler';
import { resolveENS } from 'modules/web3/ens';
import { fetchDelegatedTo } from 'modules/delegates/api/fetchDelegatedTo';
import { DelegationHistory } from 'modules/delegates/types';
import BigNumber from 'bignumber.js';

export type MKRDelegatedToAPIResponse = {
  delegatedTo: DelegationHistory[];
  totalDelegated: number;
};
export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse<MKRDelegatedToAPIResponse>) => {
    const network = (req.query.network as string) || DEFAULT_NETWORK;
    const tempAddress = req.query.address as string;
    invariant(isSupportedNetwork(network), `unsupported network ${network}`);

    const address = tempAddress.indexOf('.eth') !== -1 ? await resolveENS(tempAddress) : tempAddress;

    const delegatedTo = await fetchDelegatedTo(address, network);
    const totalDelegated = delegatedTo.reduce((prev, next) => {
      return prev.plus(next.lockAmount);
    }, new BigNumber(0));
    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
    res.status(200).json({
      delegatedTo,
      totalDelegated: totalDelegated.toNumber()
    });
  }
);
