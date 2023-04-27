/* eslint-disable  react/no-unknown-property */
/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import logger from 'lib/logger';
import React from 'react';
import theme from 'lib/theme';

export default function Icon({
  name,
  size = 3,
  color = 'currentColor',
  role = 'presentation',
  focusable = false,
  sx,
  ...rest
}: {
  name: string;
  size?: number | string;
  color?: string;
  role?: string;
  focusable?: boolean;
  sx?: any;
}): React.ReactElement | null {
  const icons = theme.icons;

  if (!icons[name]) {
    logger.error(`Icon: No icon found with name ${name}`);
    return null;
  }

  return (
    <svg
      viewBox={icons[name].viewBox || '0 0 24 24'}
      sx={{ ...sx, size: size, verticalAlign: 'middle', color }}
      color={color}
      display="inline-block"
      focusable={focusable}
      role={role}
      {...rest}
    >
      {icons[name].path}
    </svg>
  );
}
