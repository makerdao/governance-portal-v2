import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { BigNumber } from 'ethers';

type MkrOnHatResponse = {
  data?: BigNumber;
  loading: boolean;
  error: Error;
  mutate: () => void;
};

export const useMkrOnHat = (): MkrOnHatResponse => {
  const { chief } = useContracts();

  const { data, error, mutate } = useSWR<BigNumber>(
    '/executive/mkr-on-hat',
    async () => {
      const hat = await chief.hat();
      return chief.approvals(hat);
    },

    // refresh every 5 mins
    { refreshInterval: 300000 }
  );

  return {
    data,
    loading: !error && !data,
    error,
    mutate
  };
};
