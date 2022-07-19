import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { ZERO_ADDRESS } from 'modules/web3/constants/addresses';
import { config } from 'lib/config';

type VoteDelegateAddressResponse = {
  data?: string | undefined;
  loading: boolean;
  error: Error;
  mutate: () => void;
};

// Returns the vote delegate contract address for a account
export const useVoteDelegateAddress = (account?: string): VoteDelegateAddressResponse => {
  const { voteDelegateFactory } = useContracts(config.ALCHEMY_KEY_DELEGATES);

  const { data, error, mutate } = useSWR(account ? `${account}/vote-delegate-address` : null, async () => {
    const vdAddress = await voteDelegateFactory.delegates(account as string);
    return vdAddress !== ZERO_ADDRESS ? vdAddress : undefined;
  });
  return {
    data,
    loading: !error && !data,
    error,
    mutate
  };
};
