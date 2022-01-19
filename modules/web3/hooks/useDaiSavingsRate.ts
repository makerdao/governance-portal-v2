import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { BigNumber as BigNumberJs } from 'bignumber.js';
import { SECONDS_PER_YEAR } from 'lib/datetime';
import { BigNumberRAY } from '../constants/numbers';

BigNumberJs.config({ POW_PRECISION: 100 });

type DaiSavingsRateResponse = {
  data?: BigNumberJs | undefined;
  loading: boolean;
  error?: Error;
};

export const useDaiSavingsRate = (): DaiSavingsRateResponse => {
  const { pot } = useContracts();

  const { data, error } = useSWR(`${pot.address}/dai-savings-rate`, async () => {
    const dsr = await pot.dsr();
    const annualDsr = new BigNumberJs(dsr._hex).div(BigNumberRAY).pow(SECONDS_PER_YEAR).minus(1).times(100);

    return annualDsr;
  });

  return {
    data,
    loading: !error && !data,
    error
  };
};
