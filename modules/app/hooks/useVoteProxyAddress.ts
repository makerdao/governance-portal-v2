/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { getVoteProxyAddresses, VoteProxyAddresses } from '../helpers/getVoteProxyAddresses';
import { useNetwork } from './useNetwork';

type VoteProxyAddressResponse = {
  data?: VoteProxyAddresses;
  loading: boolean;
  error: Error;
};

export const useVoteProxyAddress = (account?: string): VoteProxyAddressResponse => {
  const { voteProxyFactory } = useContracts();
  const network = useNetwork();

  const { data, error } = useSWR(account ? `${account}/vote-proxy-address` : null, async () => {
    return await getVoteProxyAddresses(voteProxyFactory, account as string, network);
  });

  return {
    data,
    loading: !error && !data,
    error
  };
};
