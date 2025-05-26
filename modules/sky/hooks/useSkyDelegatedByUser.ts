/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import useSWR from 'swr';
import { useChainId } from 'wagmi';
import { chainIdToNetworkName } from 'modules/web3/helpers/chain';
import { fetchDelegationEventsByAddresses } from 'modules/delegates/api/fetchDelegationEventsByAddresses';
import { config } from 'lib/config';
import { getPublicClient } from 'modules/web3/helpers/getPublicClient';
import { voteDelegateAbi } from 'modules/contracts/ethers/abis';
import { parseEther } from 'viem';

type DelegatedByUserResponse = {
  data:
    | {
        directDelegationAmount: bigint | undefined;
        stakingEngineDelegationAmount: bigint | undefined;
        totalDelegationAmount: bigint | undefined;
      }
    | undefined;
  loading: boolean;
  error?: Error;
  mutate: () => void;
};

// Fetches the amount delegated from one user to one contract address
export const useSkyDelegatedByUser = (
  userAddress?: string,
  voteDelegateAddress?: string
): DelegatedByUserResponse => {
  const chainId = useChainId();

  if (!voteDelegateAddress) {
    return {
      data: undefined,
      loading: false,
      error: new Error('No account found'),
      mutate: () => undefined
    };
  }
  const network = chainIdToNetworkName(chainId);

  const fetchFromChain = async (userAddress: string | undefined, voteDelegateAddress: string) => {
    if (!userAddress) return undefined;

    const publicClient = getPublicClient(chainId);
    const directDelegated = await publicClient.readContract({
      address: voteDelegateAddress as `0x${string}`,
      abi: voteDelegateAbi,
      functionName: 'stake',
      args: [userAddress as `0x${string}`]
    });

    return {
      directDelegationAmount: directDelegated,
      stakingEngineDelegationAmount: undefined,
      totalDelegationAmount: directDelegated
    };
  };

  const { data, error, mutate } = useSWR(
    userAddress && voteDelegateAddress ? ['/user/sky-delegated', voteDelegateAddress, userAddress] : null,
    async () => {
      if (config.USE_MOCK_WALLET) {
        return fetchFromChain(userAddress as string, voteDelegateAddress);
      }
      try {
        const data = await fetchDelegationEventsByAddresses([voteDelegateAddress], network);
        const delegations = data.filter(x => x.immediateCaller.toLowerCase() === userAddress?.toLowerCase());
        let stakingEngineDelegated = 0n;
        let directDelegated = 0n; // Calculate this as needed
        for (let i = 0; i < delegations.length; i++) {
          try {
            const curr = delegations[i];
            const lockAmount = parseEther(curr.lockAmount.toString());
            if (curr.isStakingEngine) {
              stakingEngineDelegated = stakingEngineDelegated + lockAmount;
            } else {
              directDelegated = directDelegated + lockAmount;
            }
          } catch (innerError) {
            console.error(`Error processing delegation ${i + 1}:`, innerError);
          }
        }
        return {
          directDelegationAmount: directDelegated,
          stakingEngineDelegationAmount: stakingEngineDelegated,
          totalDelegationAmount: stakingEngineDelegated + directDelegated
        };
      } catch (outerError) {
        console.error('Error in useSkyDelegatedByUser. Fetching from chain instead. Error:', outerError);
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
