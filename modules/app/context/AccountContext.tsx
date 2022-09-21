import React, { ReactNode } from 'react';
import { ethers } from 'ethers';
import { useCurrentUserVoteDelegateContract } from 'modules/delegates/hooks/useCurrentUserVoteDelegateContract';
import { useVoteDelegateAddress } from 'modules/delegates/hooks/useVoteDelegateAddress';
import { useGoerliForkWindowBindings } from 'modules/web3/hooks/useGoerliForkWindowBindings';
import { useCurrentUserVoteProxyContract } from '../hooks/useCurrentUserVoteProxyContract';
import { useCurrentUserVoteProxyOldContract } from '../hooks/useCurrentUserVoteProxyOldContract';
import { useVoteProxyAddress } from '../hooks/useVoteProxyAddress';
import { useVoteProxyOldAddress } from '../hooks/useVoteProxyOldAddress';
import { useWeb3React } from '@web3-react/core';

interface AccountContextProps {
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

  // Voting account is either the normal wallet address, the delegateContract address or the vote proxy address
  votingAccount?: string;

  mutate?: () => void;
}

export const AccountContext = React.createContext<AccountContextProps>({ mutate: () => null });

type PropTypes = {
  children: ReactNode;
};

export const AccountProvider = ({ children }: PropTypes): React.ReactElement => {
  const { account } = useWeb3React();

  const { data: voteDelegateContract } = useCurrentUserVoteDelegateContract();
  const { data: voteDelegateContractAddress, mutate: mutateVoteDelegate } = useVoteDelegateAddress(account);

  const { data: voteProxyResponse } = useVoteProxyAddress(account);
  const { data: voteProxyOldResponse } = useVoteProxyOldAddress(account);

  const { data: voteProxyContract } = useCurrentUserVoteProxyContract();
  const { data: voteProxyOldContract } = useCurrentUserVoteProxyOldContract();

  // Use for tesing purposes, allow to log-in an account on the localhost network with a fork of goerli
  useGoerliForkWindowBindings();

  // In order of priority for voting: 1) Delegate contract, 2) Proxy 3) Wallet account
  const votingAccount = voteDelegateContractAddress
    ? voteDelegateContractAddress
    : voteProxyResponse?.voteProxyAddress
    ? voteProxyResponse?.voteProxyAddress
    : account;

  return (
    <AccountContext.Provider
      value={{
        account,

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

        votingAccount,

        mutate: () => {
          mutateVoteDelegate();
        }
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};
