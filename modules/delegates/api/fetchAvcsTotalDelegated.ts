/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { gqlRequest } from 'modules/gql/gqlRequest';
import { totalMkrDelegatedToGroup } from 'modules/gql/queries/totalMkrDelegatedToGroup';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { AvcStats, AvcWithCountAndDelegates } from '../types/avc';
import logger from 'lib/logger';

export async function fetchAvcsTotalDelegated(
  avcs: AvcWithCountAndDelegates[],
  network: SupportedNetworks
): Promise<AvcStats[]> {
  const avcsData = await Promise.all(
    avcs.map(async avc => {
      try {
        const res = await gqlRequest({
          chainId: networkNameToChainId(network),
          query: totalMkrDelegatedToGroup,
          variables: {
            delegates: avc.delegates
          }
        });

        const mkrDelegated: number = +res.totalMkrDelegatedToGroup;
        return {
          avc_name: avc.avc_name,
          count: avc.count,
          picture: avc.picture,
          mkrDelegated
        };
      } catch (e) {
        logger.error('fetchAvcTotalDelegated: Error fetching MKR delegated to AVC', e.message);
        return {
          avc_name: avc.avc_name,
          count: avc.count,
          picture: avc.picture,
          mkrDelegated: 0
        };
      }
    })
  );

  return avcsData;
}
