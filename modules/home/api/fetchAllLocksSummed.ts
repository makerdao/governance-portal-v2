import BigNumber from 'bignumber.js';
import { format } from 'date-fns';
import { gqlRequest } from 'modules/gql/gqlRequest';
import { allLocksSummed } from 'modules/gql/queries/allLocksSummed';

export default async function fetchAllLocksSummed(unixtimeStart, unixtimeEnd) {
  const data = await gqlRequest({
    chainId: 1,
    query: allLocksSummed,
    variables: {
      unixtimeStart,
      unixtimeEnd
    }
  });

  const locks = data?.allLocksSummed?.nodes.map((x, i) => {
    x.unixDate = new Date(x.blockTimestamp).getTime() / 1000;
    x.total = new BigNumber(x.lockTotal).toNumber();
    x.month = format(new Date(x.blockTimestamp), 'M');
    return x;
    // x['MKR'] = new BigNumber(x.lockTotal).toNumber();
  });

  console.log('locks', locks[0]);

  return locks || [];
}
