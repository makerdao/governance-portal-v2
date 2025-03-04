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

type DelegatedByUserResponse = {
  data: {
    directDelegationAmount: BigNumber | undefined;
    sealDelegationAmount: BigNumber | undefined;
    totalDelegationAmount: BigNumber | undefined;
  } | undefined;
  loading: boolean;
  error?: Error;
  mutate: () => void;
};

// Fetches the amount delegated from one user to one contract address
export const useMkrDelegatedByUser = (
  userAddress?: string,
  voteDelegateAddress?: string
): DelegatedByUserResponse => {
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

  const fetchFromChain = async(userAddress: string | undefined, voteDelegateAddress: string | undefined) => {
    const contract = getEthersContracts<VoteDelegate>(
      voteDelegateAddress as string,
      abi,
      chainId,
      provider,
      account,
      true
    );
  
    const directDelegated = await contract.stake(userAddress as string);

    return {
      directDelegationAmount: directDelegated,
      sealDelegationAmount: undefined,
      totalDelegationAmount: directDelegated
    };
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
        let sealDelegated = BigNumber.from(0);
        let directDelegated = BigNumber.from(0); // Calculate this as needed
        for (let i = 0; i < delegations.length; i++) {
          try {
            const curr = delegations[i];
            const lockAmount = BigNumber.from(ethers.utils.parseUnits(curr.lockAmount.toString(), 18));
            if (curr.isLockstake) {
              sealDelegated = sealDelegated.add(lockAmount);
            } else {
              directDelegated = directDelegated.add(lockAmount);
            }
          } catch (innerError) {
            console.error(`Error processing delegation ${i + 1}:`, innerError);
          }
        }
        return {
          directDelegationAmount: directDelegated,
          sealDelegationAmount: sealDelegated,
          totalDelegationAmount: sealDelegated.add(directDelegated)
        };
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
