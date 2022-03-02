import { ethers } from 'ethers';
import { useCurrentUserVoteDelegateContract } from 'modules/delegates/hooks/useCurrentUserVoteDelegateContract';
import { useVoteDelegateAddress } from 'modules/delegates/hooks/useVoteDelegateAddress';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { useEagerConnect } from 'modules/web3/hooks/useEagerConnect';
import { useGoerliForkWindowBindings } from 'modules/web3/hooks/useGoerliForkWindowBindings';
import React, { ReactNode } from 'react';
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

export const AccountProvider = ({ children }: PropTypes): React.ReactElement => {
  ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR);
  const { account } = useActiveWeb3React();

  const { data: voteDelegateContract } = useCurrentUserVoteDelegateContract();
  const { data: voteDelegateContractAddress, mutate: mutateVoteDelegate } = useVoteDelegateAddress(account);

  const { data: voteProxyResponse } = useVoteProxyAddress(account);
  const { data: voteProxyOldResponse } = useVoteProxyOldAddress(account);

  const { data: voteProxyContract } = useCurrentUserVoteProxyContract();
  const { data: voteProxyOldContract } = useCurrentUserVoteProxyOldContract();

  // try to eagerly connect to an injected provider, if it exists and has granted access already
  useEagerConnect();

  // Use for tesing purposes, allow to log-in an account on the localhost network with a fork of goerli
  useGoerliForkWindowBindings();

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

        mutate: () => {
          mutateVoteDelegate();
        }
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};
