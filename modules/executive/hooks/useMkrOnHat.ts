/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { BigNumber } from 'ethers';
import { getChiefApprovals } from 'modules/web3/api/getChiefApprovals';
import { useChainId } from 'wagmi';
import { chainIdToNetworkName } from 'modules/web3/helpers/chain';

type MkrOnHatResponse = {
  data?: BigNumber;
  loading: boolean;
  error?: Error;
  mutate: () => void;
};

export const useMkrOnHat = (): MkrOnHatResponse => {
  const chainId = useChainId();
  const network = chainIdToNetworkName(chainId);
  const { chief } = useContracts();

  const { data, error, mutate } = useSWR(`${chief.address}/mkr-on-hat`, async () => {
    const hatAddress = await chief.hat();
    return await getChiefApprovals(hatAddress, network);
  });

  return {
    data,
    loading: !error && !data,
    error,
    mutate
  };
};
