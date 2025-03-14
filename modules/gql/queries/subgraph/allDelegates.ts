/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { gql } from 'graphql-request';

export const allDelegates = gql`
  {
    delegates(first: 1000) {
      blockTimestamp
      ownerAddress
      id
      totalDelegated
      version
      voter {
        lastVotedTimestamp
      }
    }
  }
`;
