/*
SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import { gql } from 'graphql-request';

export const lastVotedArbitrum = gql`
    query lastVotedArbitrum($argAddresses: [String!]) {
    arbitrumVoters(where: {id_in: $argAddresses}) {
        id
        pollVotes(orderBy: blockTime, orderDirection: desc, first: 1) {
            blockTime
        }
    }
}
`;
