import BigNumber from 'bignumber.js';
import { format } from 'date-fns';
import { gqlRequest } from 'modules/gql/gqlRequest';
import { allLocksSummed } from 'modules/gql/queries/allLocksSummed';

export type AllLocksResponse = {
  fromAddress: string;
  immediateCaller: string;
  lockAmount: string;
  blockNumber: string;
  blockTimestamp: string;
  lockTotal: string;
  hash: string;
};

export default async function fetchAllLocksSummed(
  unixtimeStart: number,
  unixtimeEnd: number
): Promise<AllLocksResponse[]> {
  const data = await gqlRequest({
    chainId: 1,
    query: allLocksSummed,
    variables: {
      unixtimeStart,
      unixtimeEnd
    }
  });

  // TODO move this logic to a formatting function in the component
  const locks = data?.allLocksSummed?.nodes.map((x, i) => {
    x.unixDate = Math.floor(new Date(x.blockTimestamp).getTime() / 1000);
    x.total = new BigNumber(x.lockTotal).div(1000).toFixed(0);
    x.month = format(new Date(x.blockTimestamp), 'M');
    return x;
    // x['MKR'] = new BigNumber(x.lockTotal).toNumber();
  });

  console.log('locks', locks[0]);

  return locks || [];
}
