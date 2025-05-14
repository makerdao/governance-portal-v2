/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Flex, Text } from 'theme-ui';
import { useAccount } from 'modules/app/hooks/useAccount';
import { useSkyVotingWeight } from 'modules/mkr/hooks/useSkyVotingWeight';
import { formatValue } from 'lib/string';
import Deposit from 'modules/mkr/components/Deposit';
import Withdraw from 'modules/mkr/components/Withdraw';

export default function VotingWeight(): JSX.Element {
  const { account, voteDelegateContractAddress } = useAccount();

  const { data: votingWeight, mutate: mutateVotingWeight } = useSkyVotingWeight({ address: account });

  return (
    <>
      <Flex
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: 'row',
          width: '100%'
        }}
      >
        <Flex sx={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text as="p" color="textSecondary">
            Voting weight
          </Text>
        </Flex>
        <Text sx={{ color: 'text' }}>{(votingWeight || votingWeight === 0n) ? `${formatValue(votingWeight)} SKY` : '--'}</Text>
      </Flex>
      {!voteDelegateContractAddress && (
        <Flex sx={{ mt: [3, 2], gap: 2, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <Deposit sx={{ width: '50%' }} mutateLockedSky={mutateVotingWeight} />
          <Withdraw sx={{ width: '50%' }} mutateLockedSky={mutateVotingWeight} />
        </Flex>
      )}
    </>
  );
}
