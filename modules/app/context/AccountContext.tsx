import { ethers } from 'ethers';
import { useCurrentUserVoteDelegateContract } from 'modules/delegates/hooks/useCurrentUserVoteDelegateContract';
import { useVoteDelegateAddress } from 'modules/delegates/hooks/useVoteDelegateAddress';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import React, { ReactNode } from 'react';
import useSWR from 'swr';
import { useCurrentUserVoteProxyContract } from '../hooks/useCurrentUserVoteProxyContract';
import { useCurrentUserVoteProxyOldContract } from '../hooks/useCurrentUserVoteProxyOldContract';
import { useVoteProxyAddress } from '../hooks/useVoteProxyAddress';
import { useVoteProxyOldAddress } from '../hooks/useVoteProxyOldAddress';

interface ContextProps {
  account?: string;

  voteDelegateContract?: ethers.Contract;
  voteDelegateContractAddress?: string;

  voteProxyContract?: ethers.Contract;
  voteProxyContractAddress?: string;
  voteProxyHotAddress?: string;
  voteProxyColdAddress?: string;

  voteProxyOldContract?: ethers.Contract;
  voteProxyOldContractAddress?: string;
  voteProxyOldHotAddress?: string;
  voteProxyOldColdAddress?: string;

  mutate?: () => void;
}

export const AccountContext = React.createContext<ContextProps>({ mutate: () => null });

type PropTypes = {
  children: ReactNode;
};

const fetchAccountData = (account: string) => {
  const { data: voteDelegateContract } = useCurrentUserVoteDelegateContract();
  const { data: voteDelegateContractAddress, mutate: mutateVoteDelegate } = useVoteDelegateAddress(account);

  const { data: voteProxyResponse } = useVoteProxyAddress(account);
  const { data: voteProxyOldResponse } = useVoteProxyOldAddress(account);

  const { data: voteProxyContract } = useCurrentUserVoteProxyContract();
  const { data: voteProxyOldContract } = useCurrentUserVoteProxyOldContract();

  return {
    voteDelegateContract,
    voteDelegateContractAddress,

    voteProxyContract,
    voteProxyContractAddress: voteProxyResponse?.voteProxyAddress,
    voteProxyHotAddress: voteProxyResponse?.hotAddress,
    voteProxyColdAddress: voteProxyResponse?.coldAddress,

    voteProxyOldContract,
    voteProxyOldContractAddress: voteProxyOldResponse?.voteProxyAddress,
    voteProxyOldHotAddress: voteProxyOldResponse?.hotAddress,
    voteProxyOldColdAddress: voteProxyOldResponse?.coldAddress,

    mutate: () => {
      mutateVoteDelegate();
    }
  };
};

export const AccountProvider = ({ children }: PropTypes): React.ReactElement => {
  const { account } = useActiveWeb3React();

  const { data } = useSWR(`account/${account}`, account => fetchAccountData(account));

  return (
    <AccountContext.Provider
      value={{
        account,
        ...data
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};
