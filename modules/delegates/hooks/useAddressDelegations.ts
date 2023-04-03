/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { fetchJson } from 'lib/fetchJson';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { MKRAddressDelegationsAPIResponse } from 'pages/api/address/[address]/delegations';
import useSWR from 'swr';

export function useAddressDelegations(
  address: string | undefined,
  network: SupportedNetworks
): MKRAddressDelegationsAPIResponse | undefined {
  const { data } = useSWR<MKRAddressDelegationsAPIResponse>(
    address ? `/api/address/${address}/delegations?network=${network}` : null,
    fetchJson,
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
      revalidateOnMount: true
    }
  );

  return data;
}
