import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { BigNumber } from 'ethers';

type TotalDaiResponse = {
  data?: BigNumber | undefined;
  loading: boolean;
  error?: Error;
};

export const useTotalDai = (): TotalDaiResponse => {
  const { vat } = useContracts();

  const { data, error } = useSWR(`${vat.address}/total-dai`, async () => {
    return await vat.debt();
  });

  return {
    data,
    loading: !error && !data,
    error
  };
};
