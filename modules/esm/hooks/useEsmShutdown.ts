/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useChainId } from 'wagmi';
import { useWriteContractFlow } from 'modules/web3/hooks/useWriteContractFlow';
import { WriteHook, WriteHookParams } from 'modules/web3/types/hooks';
import { esmAbi, esmAddress } from 'modules/contracts/generated';
import { config } from 'lib/config';

export const useEsmShutdown = ({
  gas,
  enabled: paramEnabled = true,
  onSuccess,
  onError,
  onStart
}: WriteHookParams): WriteHook => {
  const chainId = useChainId();

  return useWriteContractFlow({
    address: esmAddress[chainId],
    abi: esmAbi,
    functionName: 'fire',
    chainId,
    enabled: paramEnabled && !config.READ_ONLY,
    gas,
    onSuccess,
    onError,
    onStart
  });
};
