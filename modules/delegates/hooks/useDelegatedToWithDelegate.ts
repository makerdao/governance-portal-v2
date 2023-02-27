/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { fetchJson } from 'lib/fetchJson';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { MKRDelegatedToWithDelegateAPIResponse } from 'pages/api/address/[address]/delegatedToWithDelegates';
import useSWR from 'swr';

export function useDelegatedToWithDelegates(
  address: string | undefined,
  network: SupportedNetworks
): MKRDelegatedToWithDelegateAPIResponse | undefined {
  const { data } = useSWR<MKRDelegatedToWithDelegateAPIResponse>(
    address ? `/api/address/${address}/delegatedToWithDelegates?network=${network}` : null,
    fetchJson,
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
      revalidateOnMount: true
    }
  );

  return data;
}
