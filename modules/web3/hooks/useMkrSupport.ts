/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { BigNumber } from 'ethers';

type MkrSupportResponse = {
  data: BigNumber | undefined;
  loading: boolean;
  error: Error;
  mutate: () => void;
};

export const useMkrSupport = (proposalAddress: string): MkrSupportResponse => {
  const { chief } = useContracts();

  const { data, error, mutate } = useSWR<BigNumber>(`${proposalAddress}/executive/mkr-support`, async () => {
    return await chief.approvals(proposalAddress);
  });

  return {
    data,
    loading: !error && !data,
    error,
    mutate
  };
};
