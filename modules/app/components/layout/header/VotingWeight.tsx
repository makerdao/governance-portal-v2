/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Flex, Text } from 'theme-ui';
import { useSkyVotingWeight } from 'modules/mkr/hooks/useSkyVotingWeight';
import { useAccount } from 'modules/app/hooks/useAccount';
import { formatValue } from 'lib/string';

export default function VotingWeight(): JSX.Element {
  const { account } = useAccount();
  const { data: votingWeight } = useSkyVotingWeight({ address: account });

  return (
    <>
      <Flex sx={{ pt: 4, alignItems: 'center', gap: 2 }}>
        <Text variant="caps" as="h4">
          Voting weight
        </Text>
      </Flex>
      <Flex>
        <Text sx={{ fontSize: 5 }} data-testid="polling-voting-weight">
          {(votingWeight || votingWeight === 0n) ? `${formatValue(votingWeight)} SKY` : '--'}
        </Text>
      </Flex>
      <Flex sx={{ py: 1 }}>
        <Text variant="secondary">
          Your voting weight is the amount of SKY you have locked in the voting contract. This weight applies
          to both polling and executive votes.
        </Text>
      </Flex>
    </>
  );
}
