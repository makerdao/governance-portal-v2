import useSWR from 'swr';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { useContracts } from 'modules/web3/hooks/useContracts';

type UseDaiBalanceResponse = {
  data?: any;
  loading: boolean;
  error?: Error;
  mutate: () => void;
};

// takes optional address argument in case we are fetching a balance
// other than for a connected account
// if no address passed, assume we want connected account balance
export const useMkrBalance = (address?: string): UseDaiBalanceResponse => {
  let account;

  if (address) {
    account = address;
  } else {
    const activeWeb3 = useActiveWeb3React();
    account = activeWeb3.account;
  }

  const { mkr } = useContracts();

  const { data, error, mutate } = useSWR(`mkr-balance-new-${account}`, async () => {
    if (!account) {
      return 0;
    }

    return await mkr.balanceOf(account);
  });

  return {
    data,
    loading: !error && !data,
    error,
    mutate
  };
};
