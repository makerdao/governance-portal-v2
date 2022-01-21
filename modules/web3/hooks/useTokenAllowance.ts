import BigNumber from 'bignumber.js';
import useSWR from 'swr';
import { ContractName } from '../types/contracts';
import { useContracts } from './useContracts';

type TokenAllowanceResponse = {
  data?: BigNumber;
  loading: boolean;
  error?: Error;
  mutate: () => void;
};

// Checks if the user allowed the spending of a token and contract address
export const useTokenAllowance = (
  name: ContractName,
  userAddress?: string,
  contractAddress?: string
): TokenAllowanceResponse => {
  const token = useContracts()[name];

  const { data, error, mutate } = useSWR(
    userAddress && contractAddress ? ['token-balance', token.address, userAddress, contractAddress] : null,
    async (_, tokenAddress, userAddress, contractAddress) => {
      const ethersBn = await token.allowance(userAddress, contractAddress);
      return new BigNumber(ethersBn._hex);
    }
  );

  return {
    data,
    loading: !error && !data,
    error,
    mutate
  };
};
