import React from 'react';
import Tooltip from 'modules/app/components/Tooltip';
import { formatDateWithTime, formatTimeAgo } from 'lib/datetime';
import { Text } from 'theme-ui';

export function DateWithHover({
  date,
  timeago,
  label
}: {
  date: Date | string | number;
  timeago?: boolean;
  label?: string;
}): React.ReactElement {
  return (
    <Tooltip label={label ? label : formatDateWithTime(date ?? '')}>
      <Text>{timeago ? `${formatTimeAgo(date ?? '')}` : `${formatDateWithTime(date ?? '')}`}</Text>
    </Tooltip>
  );
}
