/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { gql } from 'graphql-request';

export const uniswapV3MkrSupply = gql`
  query uniswapV3MkrSupply($argMkrAddress: String!) {
    token(id: $argMkrAddress) {
      symbol
      totalValueLocked
    }
  }
`;
