/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { BigNumber } from 'ethers';

type MkrBalanceResponse = {
  data?: BigNumber;
  loading?: boolean;
  error?: Error;
  mutate: () => void;
};

export const useMkrBalance = (address?: string): MkrBalanceResponse => {
  const { mkr } = useContracts();
  const { data, error, mutate } = useSWR(
    address ? ['/user/mkr-balance', address] : null,
    (_, address) => mkr.balanceOf(address),
    { revalidateOnMount: true }
  );

  return {
    data: data,
    loading: !error && !data,
    error,
    mutate
  };
};
