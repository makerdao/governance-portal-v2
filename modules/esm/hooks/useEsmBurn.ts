/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { WriteHook, WriteHookParams } from 'modules/web3/types/hooks';
import { useChainId } from 'wagmi';
import { useWriteContractFlow } from 'modules/web3/hooks/useWriteContractFlow';
import { esmAbi, esmAddress } from 'modules/contracts/generated';
import { config } from 'lib/config';

export const useEsmBurn = ({
  burnAmount,
  gas,
  enabled: paramEnabled = true,
  onSuccess,
  onError,
  onStart
}: WriteHookParams & {
  burnAmount: bigint;
}): WriteHook => {
  const chainId = useChainId();

  return useWriteContractFlow({
    address: esmAddress[chainId],
    abi: esmAbi,
    functionName: 'join',
    args: [burnAmount],
    chainId,
    enabled: paramEnabled && !config.READ_ONLY,
    gas,
    onSuccess,
    onError,
    onStart
  });
};
