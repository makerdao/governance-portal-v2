/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { TokenName } from '../types/tokens';
import { useChainId } from 'wagmi';
import { useWriteContractFlow } from './useWriteContractFlow';
import { tokenNameToConfig } from '../helpers/tokenNameToConfig';
import { WriteHook, WriteHookParams } from '../types/hooks';

// Maximum possible number for ERC20 approvals (2^256 - 1)
const MAX_UINT256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935';

export const useApproveUnlimitedToken = ({
  name,
  addressToApprove,
  gas,
  enabled: paramEnabled = true,
  onSuccess,
  onError,
  onStart
}: WriteHookParams & {
  name: TokenName;
  addressToApprove: string;
}): WriteHook => {
  const chainId = useChainId();
  const tokenConfig = tokenNameToConfig(name);

  return useWriteContractFlow({
    address: tokenConfig?.address[chainId],
    abi: tokenConfig?.abi,
    functionName: 'approve',
    args: [addressToApprove as `0x${string}`, MAX_UINT256],
    chainId,
    enabled: paramEnabled,
    gas,
    onSuccess,
    onError,
    onStart
  });
};
