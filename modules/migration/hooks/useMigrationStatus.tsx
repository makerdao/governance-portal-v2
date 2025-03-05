/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useDelegatedTo } from 'modules/delegates/hooks/useDelegatedTo';
import { useDelegateContractExpirationDate } from 'modules/delegates/hooks/useDelegateContractExpirationDate';
import { isExpiredCheck } from '../helpers/expirationChecks';
import BigNumber from 'bignumber.js';
import useSWR, { useSWRConfig } from 'swr';
import { AddressApiResponse } from 'modules/address/types/addressApiResponse';
import { fetchJson } from 'lib/fetchJson';
import { useNetwork } from 'modules/app/hooks/useNetwork';
import { useAccount } from 'wagmi';

export function useMigrationStatus(): {
  isDelegateContractExpired: boolean;
  isShadowDelegate: boolean;
  isDelegateV1Contract: boolean;
  isDelegatedToV1Contract: boolean;
} {
  const { address } = useAccount();
  const network = useNetwork();
  const { cache } = useSWRConfig();

  const { data: delegatedToData } = useDelegatedTo(address, network);
  const {
    data: { expiration: delegateContractExpirationDate, voteDelegateContractAddress }
  } = useDelegateContractExpirationDate();

  const dataKeyAccount = `/api/address/${voteDelegateContractAddress}?network=${network}`;
  const { data: addressDetailData } = useSWR<AddressApiResponse>(
    voteDelegateContractAddress ? dataKeyAccount : null,
    fetchJson,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnMount: !cache.get(dataKeyAccount),
      revalidateOnReconnect: false
    }
  );

  const isShadowDelegate = voteDelegateContractAddress
    ? addressDetailData
      ? addressDetailData.delegateInfo?.name === 'Shadow Delegate'
      : true
    : true;

  const isDelegateV1Contract = !!delegateContractExpirationDate;

  // check if is delegating to an expired contract, independently of its renewal status
  const isDelegateContractExpired =
    isDelegateV1Contract && delegateContractExpirationDate
      ? isExpiredCheck(delegateContractExpirationDate)
      : false;

  const isDelegatedToV1Contract = delegatedToData
    ? delegatedToData.delegatedTo.reduce((acc, cur) => {
        return acc || (!!cur.expirationDate && cur.isRenewedToV2 && new BigNumber(cur.lockAmount).gt(0));
      }, false)
    : false;

  return {
    isDelegateContractExpired,
    isShadowDelegate,
    isDelegateV1Contract,
    isDelegatedToV1Contract
  };
}
