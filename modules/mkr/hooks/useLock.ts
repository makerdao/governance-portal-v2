/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useWriteContractFlow } from 'modules/web3/hooks/useWriteContractFlow';
import { chiefAbi, chiefAddress } from 'modules/contracts/generated';
import { useChainId } from 'wagmi';
import { WriteHook, WriteHookParams } from 'modules/web3/types/hooks';
import { useAccount } from 'modules/app/hooks/useAccount';
import { voteProxyAbi } from 'modules/contracts/ethers/abis';

export const useLock = ({
  mkrToDeposit,
  gas,
  // enabled: paramEnabled = true,
  onSuccess,
  onError,
  onStart
}: WriteHookParams & {
  mkrToDeposit: bigint;
}): WriteHook => {
  const chainId = useChainId();
  const { voteProxyContractAddress } = useAccount();

  const commonParams = {
    functionName: 'lock',
    args: [mkrToDeposit],
    chainId,
    // enabled: paramEnabled,
    enabled: false,
    gas,
    onSuccess,
    onError,
    onStart
  } as const;

  const useWriteContractFlowResponseProxy = useWriteContractFlow({
    address: voteProxyContractAddress as `0x${string}` | undefined,
    abi: voteProxyAbi,
    ...commonParams
  });

  const useWriteContractFlowResponseChief = useWriteContractFlow({
    address: chiefAddress[chainId],
    abi: chiefAbi,
    ...commonParams
  });

  return voteProxyContractAddress ? useWriteContractFlowResponseProxy : useWriteContractFlowResponseChief;
};
