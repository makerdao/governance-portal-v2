import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { TokenName } from 'modules/web3/types/tokens';

type UseTotalSupplyResponse = {
  data?: any;
  loading: boolean;
  error?: Error;
  mutate: () => void;
};

export const useTotalSupply = (token: TokenName): UseTotalSupplyResponse => {
  const contracts = useContracts();
  const tokenContract = contracts[token];

  const { data, error, mutate } = useSWR(`${tokenContract.address}/${token}-total-supply`, async () => {
    return await tokenContract.totalSupply();
  });

  return {
    data,
    loading: !error && !data,
    error,
    mutate
  };
};
