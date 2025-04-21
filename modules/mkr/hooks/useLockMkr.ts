/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useWriteContractFlow } from 'modules/web3/hooks/useWriteContractFlow';
import { chiefAbi, chiefAddress } from 'modules/contracts/generated';
import { useChainId } from 'wagmi';
import { WriteHook, WriteHookParams } from 'modules/web3/types/hooks';

// TODO I think this can be deleted
export const useLockMkr = ({
  mkrToDeposit,
  gas,
  enabled: paramEnabled = true,
  onSuccess,
  onError,
  onStart
}: WriteHookParams & {
  mkrToDeposit: bigint;
}): WriteHook => {
  const chainId = useChainId();

  return useWriteContractFlow({
    address: chiefAddress[chainId],
    abi: chiefAbi,
    functionName: 'lock',
    args: [mkrToDeposit],
    chainId,
    enabled: paramEnabled,
    gas,
    onSuccess,
    onError,
    onStart
  });
};
