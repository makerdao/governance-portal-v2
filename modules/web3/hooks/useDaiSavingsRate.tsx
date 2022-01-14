import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { BigNumber } from 'ethers';
import { formatValue } from 'lib/string';
import { SECONDS_PER_YEAR } from 'lib/datetime';
import { RAY } from 'modules/web3/web3.constants';

type TotalDaiResponse = {
  data?: BigNumber | undefined;
  loading: boolean;
  error?: Error;
};

export const useDaiSavingsRate = (): TotalDaiResponse => {
  const { pot } = useContracts();

  const { data, error } = useSWR('dai-savings-rate', async () => {
    const dsr = await pot.dsr();

    // this returns 1 when it should be 1000000000003170820659990704
    // console.log(dsr.toNumber());
    // console.log(dsr.div(RAY));

    // return dsr.pow(SECONDS_PER_YEAR).sub(1);
    return dsr;
  });

  return {
    data,
    loading: !error && !data,
    error
  };
};

// async getYearlyRate() {
//   const dsr = new BigNumber((await this._pot.dsr())._hex).div(RAY);
//   return dsr.pow(SECONDS_PER_YEAR).minus(1);
// }
