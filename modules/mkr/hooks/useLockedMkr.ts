import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { getChiefDeposits } from 'modules/web3/api/getChiefDeposits';
import { BigNumber } from 'ethers';

type LockedMkrData = {
  data?: BigNumber;
  loading: boolean;
  error: Error;
  mutate: () => void;
};

export const useLockedMkr = (address?: string): LockedMkrData => {
  const { chief } = useContracts();

  const { data, error, mutate } = useSWR(
    address ? `${chief.address}/user/mkr-locked${address}` : null,
    async () => {
      return address ? await getChiefDeposits(address, chief) : undefined;
    },
    {
      revalidateOnFocus: false,
      revalidateOnMount: true
    }
  );

  return {
    data,
    loading: !error && !data,
    error,
    mutate
  };
};
