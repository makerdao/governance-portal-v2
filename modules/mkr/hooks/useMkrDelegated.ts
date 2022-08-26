import useSWR from 'swr';
import abi from 'modules/contracts/ethers/voteDelegate.json';

import { getEthersContracts } from 'modules/web3/helpers/getEthersContracts';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import { BigNumber } from 'ethers';
import { VoteDelegate } from 'types/ethers-contracts';

type TokenAllowanceResponse = {
  data: BigNumber | undefined;
  loading: boolean;
  error?: Error;
  mutate: () => void;
};

// Fetches the amount delegated from one user to one contract address
export const useMkrDelegated = (
  userAddress?: string,
  voteDelegateAddress?: string
): TokenAllowanceResponse => {
  const { chainId, provider, account } = useWeb3();

  const { data, error, mutate } = useSWR(
    userAddress && voteDelegateAddress ? ['/user/mkr-delegated', voteDelegateAddress, userAddress] : null,
    async () => {
      const contract = getEthersContracts<VoteDelegate>(
        voteDelegateAddress as string,
        abi,
        chainId,
        provider,
        account,
        true
      );

      return await contract.stake(userAddress as string);
    },
    {
      revalidateOnMount: true,
      revalidateOnFocus: false
    }
  );

  return {
    data,
    loading: !error && !data,
    error,
    mutate
  };
};
