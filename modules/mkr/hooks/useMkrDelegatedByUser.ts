/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import useSWR from 'swr';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import { BigNumber, ethers } from 'ethers';
import { chainIdToNetworkName } from 'modules/web3/helpers/chain';
import { fetchDelegationEventsByAddresses } from 'modules/delegates/api/fetchDelegationEventsByAddresses';
import abi from 'modules/contracts/ethers/voteDelegate.json';
import { getEthersContracts } from 'modules/web3/helpers/getEthersContracts';
import { VoteDelegate } from 'types/ethers-contracts';
import { config } from 'lib/config';

type TokenAllowanceResponse = {
  data: BigNumber | undefined;
  loading: boolean;
  error?: Error;
  mutate: () => void;
};

// Fetches the amount delegated from one user to one contract address
export const useMkrDelegatedByUser = (
  userAddress?: string,
  voteDelegateAddress?: string
): TokenAllowanceResponse => {
  const { chainId, provider, account } = useWeb3();
  if (!voteDelegateAddress) {
    return {
      data: undefined,
      loading: false,
      error: new Error('No account found'),
      mutate: () => undefined
    };
  }
  const network = chainIdToNetworkName(chainId);

  const fetchFromChain = (userAddress: string | undefined, voteDelegateAddress: string | undefined) => {
    const contract = getEthersContracts<VoteDelegate>(
      voteDelegateAddress as string,
      abi,
      chainId,
      provider,
      account,
      true
    );
  
    return contract.stake(userAddress as string);
  };

  const { data, error, mutate } = useSWR(
    userAddress && voteDelegateAddress ? ['/user/mkr-delegated', voteDelegateAddress, userAddress] : null,
    async () => {
      if (config.USE_MOCK_WALLET) {
        return fetchFromChain(userAddress, voteDelegateAddress);
      }
      try {
        const data = await fetchDelegationEventsByAddresses([voteDelegateAddress], network);
        const delegations = data.filter(x => x.immediateCaller.toLowerCase() === userAddress?.toLowerCase());
        let mkrDelegated = BigNumber.from(0);
        for (let i = 0; i < delegations.length; i++) {
          try {
            const curr = delegations[i];
            const lockAmount = BigNumber.from(ethers.utils.parseUnits(curr.lockAmount.toString(), 18));
            mkrDelegated = mkrDelegated.add(lockAmount);
          } catch (innerError) {
            console.error(`Error processing delegation ${i + 1}:`, innerError);
          }
        }
        return mkrDelegated;
      } catch (outerError) {
        console.error('Error in useMkrDelegatedByUser. Fetching from chain instead. Error:', outerError);
        return fetchFromChain(userAddress, voteDelegateAddress);
      }
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
