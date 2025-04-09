/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import Icon from 'modules/app/components/Icon';
import { Flex, Text } from 'theme-ui';

type Props = {
  label?: string;
  icon?: string;
};

export const ViewMore = ({ label = 'View more', icon = 'chevron_right' }: Props): JSX.Element => {
  const transformMap = {
    chevron_right: 'translateX(3px)',
    chevron_left: 'translateX(-3px)',
    chevron_up: 'translateY(-3px)',
    chevron_down: 'translateY(3px)'
  };

  return (
    <Flex
      sx={{
        alignItems: 'center',
        cursor: 'pointer',
        color: 'text',
        ':hover > svg': { transform: transformMap[icon] }
      }}
    >
      <Text sx={{ fontSize: 2 }}>{label}</Text>
      <Icon name={icon} size={2} sx={{ ml: 2 }} color="primary" />
    </Flex>
  );
};
