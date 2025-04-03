/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useChainId } from 'wagmi';
import { useWriteContractFlow } from 'modules/web3/hooks/useWriteContractFlow';
import { chiefAbi, chiefAddress } from 'modules/contracts/generated';
import { WriteHook, WriteHookParams } from 'modules/web3/types/hooks';

export const useFree = ({
  mkrToWithdraw,
  gas,
  enabled: paramEnabled = true,
  onSuccess,
  onError,
  onStart
}: WriteHookParams & {
  mkrToWithdraw: bigint;
}): WriteHook => {
  const chainId = useChainId();

  return useWriteContractFlow({
    address: chiefAddress[chainId],
    abi: chiefAbi,
    functionName: 'free',
    args: [mkrToWithdraw],
    chainId,
    enabled: paramEnabled,
    gas,
    onSuccess,
    onError,
    onStart
  });
};
