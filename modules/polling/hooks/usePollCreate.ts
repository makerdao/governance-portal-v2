/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useChainId } from 'wagmi';
import { useWriteContractFlow } from 'modules/web3/hooks/useWriteContractFlow';
import { pollingArbitrumAbi, pollingArbitrumAddress } from 'modules/contracts/generated';
import { WriteHook, WriteHookParams } from 'modules/web3/types/hooks';

export const usePollCreate = ({
  startDate,
  endDate,
  multiHash,
  url,
  gas,
  enabled: paramEnabled = true,
  onSuccess,
  onError,
  onStart
}: WriteHookParams & {
  startDate: bigint | undefined;
  endDate: bigint | undefined;
  multiHash: string | undefined;
  url: string | undefined;
}): WriteHook => {
  const chainId = useChainId();

  const enabled = paramEnabled && !!startDate && !!endDate && !!multiHash && !!url;

  return useWriteContractFlow({
    address: pollingArbitrumAddress[chainId],
    abi: pollingArbitrumAbi,
    functionName: 'createPoll',
    args: [startDate as bigint, endDate as bigint, multiHash as string, url as string],
    chainId,
    enabled,
    gas,
    onSuccess,
    onError,
    onStart
  });
};
