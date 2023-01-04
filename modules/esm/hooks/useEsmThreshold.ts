/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { BigNumber } from 'ethers';

type EsmThresholdResponse = {
  data?: BigNumber | undefined;
  loading: boolean;
  error?: Error;
};

export const useEsmThreshold = (): EsmThresholdResponse => {
  const { esm } = useContracts();

  const { data, error } = useSWR(`${esm.address}/esm-threshold`, async () => {
    return await esm.min();
  });

  return {
    data,
    loading: !error && !data,
    error
  };
};
