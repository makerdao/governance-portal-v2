import BigNumber from 'lib/bigNumberJs';
import { format } from 'date-fns';
import logger from 'lib/logger';
import { gqlRequest } from 'modules/gql/gqlRequest';
import { allLocksSummed } from 'modules/gql/queries/allLocksSummed';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { AllLocksResponse } from '../types/participation';

export default async function fetchAllLocksSummed(
  network: SupportedNetworks,
  unixtimeStart: number,
  unixtimeEnd: number
): Promise<AllLocksResponse[]> {
  try {
    const data = await gqlRequest({
      chainId: networkNameToChainId(network),
      query: allLocksSummed,
      variables: {
        unixtimeStart,
        unixtimeEnd
      }
    });

    const locks: AllLocksResponse[] = data?.allLocksSummed?.nodes.map(x => {
      x.unixDate = Math.floor(new Date(x.blockTimestamp).getTime() / 1000);
      x.total = new BigNumber(x.lockTotal).div(1000).toFixed(0);
      x.month = format(new Date(x.blockTimestamp), 'M');
      return x;
    });

    return locks;
  } catch (e) {
    logger.error(
      'fetchAllLocksSummed: Error fetching all lock events',
      `Start: ${unixtimeStart}, End: ${unixtimeEnd}, Network: ${network}`,
      e
    );
  }
  return [];
}
