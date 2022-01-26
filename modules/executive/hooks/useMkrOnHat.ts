import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { BigNumber } from 'ethers';
import { getChiefApprovals } from 'modules/web3/api/getChiefApprovals';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';

type MkrOnHatResponse = {
  data?: BigNumber | undefined;
  loading: boolean;
  error?: Error;
  mutate: () => void;
};

export const useMkrOnHat = (): MkrOnHatResponse => {
  const { network } = useActiveWeb3React();
  const { chief } = useContracts();

  const { data, error, mutate } = useSWR(`${chief.address}/mkr-on-hat`, async () => {
    const hatAddress = await chief.hat();
    return await getChiefApprovals(hatAddress, network);
  });

  return {
    data,
    loading: !error && !data,
    error,
    mutate
  };
};
