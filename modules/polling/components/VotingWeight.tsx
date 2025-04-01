/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Flex, Text } from 'theme-ui';
import { MKRVotingWeightResponse } from 'modules/mkr/helpers/getMKRVotingWeight';
import { useAccount } from 'modules/app/hooks/useAccount';
import { useMKRVotingWeight } from 'modules/mkr/hooks/useMKRVotingWeight';
import { formatValue } from 'lib/string';

export const getDescription = ({
  votingWeight,
  isDelegate
}: {
  votingWeight?: MKRVotingWeightResponse;
  isDelegate?: boolean;
}): JSX.Element | null => {
  if (votingWeight) {
    if (isDelegate) {
      return (
        <Text as="p">
          {'Balance of delegated MKR: ' + formatValue(votingWeight.chiefBalanceHot) + ' MKR'}
        </Text>
      );
    } else {
      return (
        <>
          <Text as="p">{'Balance in chief: ' + formatValue(votingWeight.chiefBalanceHot) + ' MKR'}</Text>
        </>
      );
    }
  }

  return null;
};

export default function VotingWeight(): JSX.Element {
  const { account } = useAccount();

  const { data: votingWeight } = useMKRVotingWeight({ address: account });

  return (
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
      <Text sx={{ color: 'text' }}>{votingWeight ? `${formatValue(votingWeight.total)} MKR` : '--'}</Text>
    </Flex>
  );
}
