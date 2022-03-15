import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { BigNumber } from 'ethers';

type MkrInEsmByAddressResponse = {
  data?: BigNumber | undefined;
  loading: boolean;
  error?: Error;
  mutate: () => void;
};

export const useMkrInEsmByAddress = (address?: string): MkrInEsmByAddressResponse => {
  const { esm } = useContracts();

  const { data, error, mutate } = useSWR(`${esm.address}/mkr-in-esm/${address}`, async () => {
    if (!address) {
      return BigNumber.from(0);
    }
    return await esm.sum(address);
  });

  return {
    data,
    loading: !error && !data,
    error,
    mutate
  };
};
