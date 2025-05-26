/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useChainId } from 'wagmi';
import { useWriteContractFlow } from 'modules/web3/hooks/useWriteContractFlow';
import { chiefAbi, chiefAddress } from 'modules/contracts/generated';
import { WriteHook, WriteHookParams } from 'modules/web3/types/hooks';

export const useFree = ({
  skyToWithdraw,
  gas,
  enabled: paramEnabled = true,
  onSuccess,
  onError,
  onStart
}: WriteHookParams & {
  skyToWithdraw: bigint;
}): WriteHook => {
  const chainId = useChainId();

  return useWriteContractFlow({
    address: chiefAddress[chainId],
    abi: chiefAbi,
    functionName: 'free',
    args: [skyToWithdraw],
    chainId,
    enabled: paramEnabled,
    gas,
    onSuccess,
    onError,
    onStart
  });
};
