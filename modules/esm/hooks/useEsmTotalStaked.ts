import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { BigNumber } from 'ethers';

type EsmTotalStakedResponse = {
  data?: BigNumber | undefined;
  loading: boolean;
  error?: Error;
  mutate: () => void;
};

export const useEsmTotalStaked = (): EsmTotalStakedResponse => {
  const { esm } = useContracts();

  const { data, error, mutate } = useSWR(`${esm.address}/esm-total-staked`, async () => {
    return await esm.Sum();
  });

  return {
    data,
    loading: !error && !data,
    error,
    mutate
  };
};
