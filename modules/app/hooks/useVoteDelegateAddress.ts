import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';

type VoteDelegateAddressResponse = {
  data?: string | undefined;
  loading: boolean;
  error: Error;
};

export const useVoteDelegateAddress = (addressToCheck?: string): VoteDelegateAddressResponse => {
  let account;

  const { voteDelegateFactory } = useContracts();

  if (addressToCheck) {
    account = addressToCheck;
  } else {
    const activeWeb3 = useActiveWeb3React();
    account = activeWeb3.account;
  }

  const { data, error } = useSWR(`${voteDelegateFactory.address}/vote-delegate-address`, async () => {
    return await voteDelegateFactory.delegates(account);
  });

  return {
    data,
    loading: !error && !data,
    error
  };
};
