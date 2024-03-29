/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useContracts } from 'modules/web3/hooks/useContracts';
import useSWR from 'swr';

type HatResponse = {
  data?: string;
  loading: boolean;
  error?: Error;
};

export const useHat = (): HatResponse => {
  const { chief } = useContracts();

  const { data, error } = useSWR<string>('/executive/hat', () => chief.hat());

  return {
    data,
    loading: !error && !data,
    error
  };
};
