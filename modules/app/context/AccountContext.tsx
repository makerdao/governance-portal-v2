/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import React, { ReactNode } from 'react';
import { useVoteDelegateAddress } from 'modules/delegates/hooks/useVoteDelegateAddress';
import { useAccount } from 'wagmi';

interface AccountContextProps {
  account?: string;
  voteDelegateContractAddress?: string;
  // Voting account is either the normal wallet address or the delegateContract address
  votingAccount?: string;
  mutate?: () => void;
}

export const AccountContext = React.createContext<AccountContextProps>({ mutate: () => null });

type PropTypes = {
  children: ReactNode;
};

export const AccountProvider = ({ children }: PropTypes): React.ReactElement => {
  const { address: account } = useAccount();
  const { data: voteDelegateContractAddress, mutate: mutateVoteDelegate } = useVoteDelegateAddress(account);
  // In order of priority for voting: 1) Delegate contract, 2) Wallet account
  const votingAccount = voteDelegateContractAddress ? voteDelegateContractAddress : account;

  return (
    <AccountContext.Provider
      value={{
        account,
        voteDelegateContractAddress,
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
