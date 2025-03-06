/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useWriteContractFlow } from 'modules/web3/hooks/useWriteContractFlow';
import { chiefAbi, chiefAddress } from 'modules/contracts/generated';
import { useChainId } from 'wagmi';
import { WriteHook } from 'modules/web3/types/hooks';

type Params = {
  mkrToDeposit: bigint;
  enabled?: boolean;
  gas?: bigint;
  onSuccess?: () => void;
  onError?: () => void;
  onStart?: () => void;
};

export const useLock = ({
  mkrToDeposit,
  gas,
  enabled: paramEnabled = true,
  onSuccess,
  onError,
  onStart
}: Params): WriteHook => {
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
