import React from 'react';
import Tooltip from 'modules/app/components/Tooltip';
import { formatDateWithTime, formatTimeAgo } from 'lib/datetime';
import { Text } from 'theme-ui';

export function DateWitHover({
  date,
  timeago
}: {
  date: Date | string;
  timeago?: boolean;
}): React.ReactElement {
  return (
    <Tooltip label={formatDateWithTime(date ?? '')}>
      <Text>{timeago ? formatTimeAgo(date ?? '') : formatDateWithTime(date ?? '')}</Text>
    </Tooltip>
  );
}
