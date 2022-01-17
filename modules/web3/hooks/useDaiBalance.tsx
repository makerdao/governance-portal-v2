import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';

type UseDaiBalanceResponse = {
  data?: any;
  loading: boolean;
  error?: Error;
  mutate: () => void;
};

// takes optional address argument in case we are fetching a balance
// other than for a connected account
// if no address passed, assume we want connected account balance
export const useDaiBalance = (address?: string): UseDaiBalanceResponse => {
  let account;

  if (address) {
    account = address;
  } else {
    const activeWeb3 = useActiveWeb3React();
    account = activeWeb3.account;
  }

  const { dai } = useContracts();

  const { data, error, mutate } = useSWR(`dai-balance-new-${account}`, async () => {
    if (!account) {
      return 0;
    }

    return await dai.balanceOf(account);
  });

  return {
    data,
    loading: !error && !data,
    error,
    mutate
  };
};
