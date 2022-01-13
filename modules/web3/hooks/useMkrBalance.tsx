import useSWR from 'swr';
import { ethers } from 'ethers';
import { getContract } from '../helpers/getContract';
import useActiveWeb3React from 'modules/web3/hooks/useActiveWeb3React';

type UseDaiBalanceResponse = {
  data?: any;
  loading: boolean;
  error?: Error;
  mutate: () => void;
};

export const useMkrBalance = (): UseDaiBalanceResponse => {
  const { account, chainId, library } = useActiveWeb3React();

  const { mkr } = getContract(chainId, library);

  const { data, error, mutate } = useSWR(`mkr-balance-new-${account}`, async () => {
    if (!account) {
      return 0;
    }
    const balance = await mkr.balanceOf(account);

    return ethers.utils.formatUnits(balance, 18);
  });

  return {
    data,
    loading: !error && !data,
    error,
    mutate
  };
};
