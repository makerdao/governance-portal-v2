import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { BigNumber } from 'ethers';

type MkrSupportResponse = {
  data: BigNumber | undefined;
  loading: boolean;
  error: Error;
  mutate: () => void;
};

export const useMkrSupport = (proposalAddress: string): MkrSupportResponse => {
  const { chief } = useContracts();

  const { data, error, mutate } = useSWR<BigNumber>(`${proposalAddress}/executive/mkr-support`, async () => {
    return await chief.approvals(proposalAddress);
  });

  return {
    data,
    loading: !error && !data,
    error,
    mutate
  };
};
