import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { BigNumber as BigNumberjs } from 'bignumber.js';
import { SECONDS_PER_YEAR } from 'lib/datetime';

BigNumberjs.config({ POW_PRECISION: 100 });
const RAY = new BigNumberjs('1e27');

type TotalDaiResponse = {
  data?: BigNumberjs | undefined;
  loading: boolean;
  error?: Error;
};

export const useDaiSavingsRate = (): TotalDaiResponse => {
  const { pot } = useContracts();

  const { data, error } = useSWR(`${pot.address}/dai-savings-rate`, async () => {
    const dsr = await pot.dsr();
    const annualDsr = new BigNumberjs(dsr._hex).div(RAY).pow(SECONDS_PER_YEAR).minus(1).times(100);

    return annualDsr;
  });

  return {
    data,
    loading: !error && !data,
    error
  };
};
