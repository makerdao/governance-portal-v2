/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Flex } from 'theme-ui';
import Icon from './Icon';

export function CircleIcon({
  name,
  iconSize = 20,
  circleSize = 54,
  iconColor = 'primary',
  borderColor = 'onSurface'
}: {
  name: string;
  iconSize?: number;
  circleSize?: number;
  iconColor?: string;
  borderColor?: string;
}): JSX.Element {
  return (
    <Flex
      sx={{
        border: '1px solid',
        borderColor: borderColor,
        borderRadius: 'round',
        width: circleSize,
        height: circleSize,
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Icon name={name} size={iconSize} color={iconColor} />
    </Flex>
  );
}
