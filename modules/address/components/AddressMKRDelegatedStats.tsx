/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Box, Flex } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { parseUnits } from 'ethers/lib/utils';
import { StatBox } from 'modules/app/components/StatBox';
import { useMKRVotingWeight } from 'modules/mkr/hooks/useMKRVotingWeight';
import { formatValue } from 'lib/string';
import Tooltip from 'modules/app/components/Tooltip';
import { getDescription } from 'modules/polling/components/VotingWeight';

export function AddressMKRDelegatedStats({
  totalMKRDelegated,
  address
}: {
  totalMKRDelegated?: number;
  address: string;
}): React.ReactElement {
  const { data: votingWeight } = useMKRVotingWeight({ address, excludeDelegateOwnerBalance: true });

  return (
    <Flex
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'row',
        marginTop: 1,
        marginBottom: 1
      }}
    >
      <StatBox
        value={votingWeight ? formatValue(votingWeight.total, undefined, undefined, true) : '0'}
        label={'Voting weight'}
      />

      <StatBox
        styles={{
          textAlign: 'right'
        }}
        value={totalMKRDelegated ? formatValue(parseUnits(totalMKRDelegated.toString())) : '0'}
        label={'Total MKR Delegated'}
      />
    </Flex>
  );
}
