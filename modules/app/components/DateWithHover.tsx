/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import React from 'react';
import Tooltip from 'modules/app/components/Tooltip';
import { formatDateWithTime, formatTimeAgo } from 'lib/datetime';
import { Text } from 'theme-ui';

export function DateWithHover({
  date,
  timeago,
  label
}: {
  date?: Date | string | number | null;
  timeago?: boolean;
  label?: string;
}): React.ReactElement {
  if (!date) {
    return <Text>N/A</Text>;
  }
  return (
    <Tooltip label={label ? label : formatDateWithTime(date)}>
      <Text>{timeago ? `${formatTimeAgo(date ?? '')}` : `${formatDateWithTime(date ?? '')}`}</Text>
    </Tooltip>
  );
}
