/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { gql } from 'graphql-request';

export const mkrDelegatedToV2 = gql`
  query mkrDelegatedToV2($argAddress: String!) {
    mkrDelegatedToV2(argAddress: $argAddress) {
      nodes {
        fromAddress
        immediateCaller
        delegateContractAddress
        lockAmount
        blockNumber
        blockTimestamp
        hash
      }
    }
  }
`;
