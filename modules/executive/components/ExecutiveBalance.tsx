/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Flex, Box, Text } from 'theme-ui';
import Deposit from 'modules/mkr/components/Deposit';
import Withdraw from 'modules/mkr/components/Withdraw';
import { formatValue } from 'lib/string';

type Props = {
  lockedSky: bigint;
  mutateLockedSky?: () => void;
  voteDelegate?: string;
};

export const ExecutiveBalance = ({ lockedSky, mutateLockedSky, voteDelegate }: Props): JSX.Element => (
  <Flex sx={{ alignItems: [null, 'center'], flexDirection: ['column', 'row'] }}>
    <Flex>
      <Text sx={{ mr: 1 }}>{voteDelegate ? 'In delegate contract:' : 'In voting contract:'} </Text>
      <Text sx={{ fontWeight: 'bold' }} data-testid="locked-sky">
        {formatValue(lockedSky, 'wad', 6)} SKY
      </Text>
    </Flex>
    {!voteDelegate && (
      <Flex sx={{ mt: [3, 0], alignItems: 'center' }}>
        <Box sx={{ ml: [0, 3] }}>
          <Deposit mutateLockedSky={mutateLockedSky} />
        </Box>
        <Withdraw sx={{ ml: 3 }} mutateLockedSky={mutateLockedSky} />
      </Flex>
    )}
  </Flex>
);
