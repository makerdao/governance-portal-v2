import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { BigNumber } from 'ethers';

type MkrOnHatResponse = {
  data?: BigNumber | undefined;
  loading: boolean;
  error?: Error;
};

export const useMkrOnHat = (): MkrOnHatResponse => {
  const { chief } = useContracts();

  const { data, error } = useSWR('mkr-on-hat', async () => {
    const hatAddress = await chief.hat();
    return await chief.approvals(hatAddress);
  });

  return {
    data,
    loading: !error && !data,
    error
  };
};
