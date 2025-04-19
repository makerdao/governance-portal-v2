/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { gql } from 'graphql-request';

export const arbitrumPollsQuery = gql`
  query ArbitrumPolls($argsSkip: Int!) {
    arbitrumPolls(
      first: 1000
      skip: $argsSkip
      where: { url_not: null, blockCreated_not: null, blockWithdrawn: null }
    ) {
      id
      url
      multiHash
    }
  }
`;
