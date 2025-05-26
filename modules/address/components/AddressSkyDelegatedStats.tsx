/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Flex } from 'theme-ui';
import { parseEther } from 'viem';
import { StatBox } from 'modules/app/components/StatBox';
import { useSkyVotingWeight } from 'modules/sky/hooks/useSkyVotingWeight';
import { formatValue } from 'lib/string';

export function AddressSkyDelegatedStats({
  totalSkyDelegated,
  address
}: {
  totalSkyDelegated?: number;
  address: string;
}): React.ReactElement {
  const { data: votingWeight } = useSkyVotingWeight({ address, excludeDelegateOwnerBalance: true });

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
        value={votingWeight ? formatValue(votingWeight, undefined, undefined, true) : '0'}
        label={'Voting weight'}
      />

      <StatBox
        styles={{
          textAlign: 'right'
        }}
        value={totalSkyDelegated ? formatValue(parseEther(totalSkyDelegated.toString())) : '0'}
        label={'Total SKY Delegated'}
      />
    </Flex>
  );
}
