/*
SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import { gql } from 'graphql-request';

export const lastVotedArbitrum = gql`
    query lastVotedArbitrum($argAddresses: [String!]) {
        voters(where: {id_in: $argAddresses}) {
            id
            arbitrumPollVotes(orderBy: blockTime, orderDirection: desc, first: 1) {
                blockTime
            }
        }
    }
`;
