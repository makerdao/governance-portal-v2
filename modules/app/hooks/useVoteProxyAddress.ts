/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { getVoteProxyAddresses, VoteProxyAddresses } from '../helpers/getVoteProxyAddresses';
import { useChainId } from 'wagmi';
import { chainIdToNetworkName } from 'modules/web3/helpers/chain';

type VoteProxyAddressResponse = {
  data?: VoteProxyAddresses;
  loading: boolean;
  error: Error;
};

export const useVoteProxyAddress = (account?: string): VoteProxyAddressResponse => {
  const { voteProxyFactory } = useContracts();
  const chainId = useChainId();
  const network = chainIdToNetworkName(chainId);

  const { data, error } = useSWR(account ? `${account}/vote-proxy-address` : null, async () => {
    return await getVoteProxyAddresses(voteProxyFactory, account as string, network);
  });

  return {
    data,
    loading: !error && !data,
    error
  };
};
