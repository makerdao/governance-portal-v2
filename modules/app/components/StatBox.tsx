/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Box, Text, Flex, ThemeUIStyleObject } from 'theme-ui';
import Skeleton from 'modules/app/components/SkeletonThemed';

type Props = {
  value?: string | JSX.Element;
  label: string;
  styles?: ThemeUIStyleObject;
  tooltip?: string | JSX.Element;
};

export const StatBox = ({ value, label, tooltip, styles }: Props): JSX.Element => {
  return (
    <Flex
      sx={{
        flexDirection: 'column',
        m: 1,
        ...styles
      }}
    >
      <Box sx={{ height: '30px' }}>
        {value ? (
          <Text
            data-testid={`${label}-stat-box`}
            as="p"
            sx={{
              color: 'secondaryAlt',
              fontWeight: 'semiBold',
              fontSize: [3, 5]
            }}
          >
            {value}
          </Text>
        ) : (
          <Box sx={{ width: 5 }}>
            <Skeleton />
          </Box>
        )}
      </Box>
      <Flex sx={{ alignItems: 'center' }}>
        <Text
          as="p"
          sx={{
            color: 'secondaryEmphasis',
            fontSize: [1, 3]
          }}
        >
          {label}
        </Text>
        {tooltip}
      </Flex>
    </Flex>
  );
};
