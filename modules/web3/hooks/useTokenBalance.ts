import useSWR from 'swr';
import { BigNumber } from 'ethers';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { TokenName } from 'modules/web3/types/tokens';

type UseTokenBalanceResponse = {
  data?: BigNumber | undefined;
  loading: boolean;
  error?: Error;
  mutate: () => void;
};

// takes optional address argument in case we are fetching a balance
// other than for a connected account
// if no address passed, assume we want connected account balance
export const useTokenBalance = (token: TokenName, address?: string): UseTokenBalanceResponse => {
  let account;

  if (address) {
    account = address;
  } else {
    const activeWeb3 = useWeb3();
    account = activeWeb3.account;
  }

  const contracts = useContracts();
  const tokenContract = contracts[token];

  const { data, error, mutate } = useSWR(`${tokenContract.address}/${token}-balance/${account}`, async () => {
    if (!account) {
      return BigNumber.from(0);
    }

    return await tokenContract.balanceOf(account);
  });

  return {
    data,
    loading: !error && !data,
    error,
    mutate
  };
};
