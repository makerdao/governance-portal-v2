import useSWR from 'swr';
import { ethers } from 'ethers';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';

type UseDaiBalanceResponse = {
  data?: any;
  loading: boolean;
  error?: Error;
  mutate: () => void;
};

export const useDaiBalance = (): UseDaiBalanceResponse => {
  const { account } = useActiveWeb3React();

  const { dai } = useContracts();

  const { data, error, mutate } = useSWR(`dai-balance-new-${account}`, async () => {
    if (!account) {
      return 0;
    }
    const balance = await dai.balanceOf(account);

    return ethers.utils.formatUnits(balance, 18);
  });

  return {
    data,
    loading: !error && !data,
    error,
    mutate
  };
};
