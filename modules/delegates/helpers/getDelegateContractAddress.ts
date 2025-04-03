/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { voteDelegateFactoryAbi, voteDelegateFactoryAddress } from 'modules/contracts/generated';
import { ZERO_ADDRESS } from 'modules/web3/constants/addresses';
import { getPublicClient } from 'modules/web3/helpers/getPublicClient';

export async function getDelegateContractAddress(
  address: string,
  chainId: number
): Promise<string | undefined> {
  const publicClient = getPublicClient(chainId);

  const voteDelegateAddress = await publicClient.readContract({
    address: voteDelegateFactoryAddress[chainId],
    abi: voteDelegateFactoryAbi,
    functionName: 'delegates',
    args: [address as `0x${string}`]
  });

  return voteDelegateAddress !== ZERO_ADDRESS ? voteDelegateAddress : undefined;
}
