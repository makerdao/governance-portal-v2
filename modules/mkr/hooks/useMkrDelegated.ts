import useSWR from 'swr';
import abi from 'modules/contracts/ethers/voteDelegate.json';

import { getEthersContracts } from 'modules/web3/helpers/getEthersContracts';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
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
  const { chainId, library, account } = useActiveWeb3React();

  const { data, error, mutate } = useSWR(
    userAddress && voteDelegateAddress ? ['/user/mkr-delegated', voteDelegateAddress, userAddress] : null,
    async () => {
      const contract = getEthersContracts<VoteDelegate>({
        contractAddress: voteDelegateAddress as string,
        abi,
        chainId,
        library,
        account,
        readOnly: true
      });

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
