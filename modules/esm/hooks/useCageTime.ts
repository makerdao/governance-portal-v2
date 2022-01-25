import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { BigNumber } from 'ethers';

type CageTimeResponse = {
  data?: BigNumber;
  loading: boolean;
  error?: Error;
};

export const useCageTime = (): CageTimeResponse => {
  const { end } = useContracts();

  const { data, error } = useSWR(`${end.address}/cage-time`, async () => {
    return await end.when();
  });

  return {
    data,
    loading: !error && !data,
    error
  };
};
