/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { BigNumber } from 'ethers';

type SystemWideDebtCeilingResponse = {
  data?: BigNumber | undefined;
  loading: boolean;
  error?: Error;
};

export const useSystemWideDebtCeiling = (): SystemWideDebtCeilingResponse => {
  const { vat } = useContracts();

  const { data, error } = useSWR(`${vat.address}/system-wide-debt-ceiling`, async () => {
    return await vat.Line();
  });

  return {
    data,
    loading: !error && !data,
    error
  };
};
