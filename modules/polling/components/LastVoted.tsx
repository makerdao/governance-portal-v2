import { Text, Flex } from 'theme-ui';
import React from 'react';
import { formatDateWithTime, formatTimeAgo } from 'lib/datetime';
import Icon from 'modules/app/components/Icon';

export default function LastVoted({
  expired,
  date,
  left = false
}: {
  expired: boolean;
  date?: string | number;
  left?: boolean;
}): React.ReactElement {
  const styles = {
    expiredCalendar: {
      fill: '#D8E0E3',
      stroke: '#D8E0E3'
    },
    yellowCalendar: {
      fill: 'voterYellow',
      stroke: 'voterYellow'
    },
    orangeCalendar: {
      fill: '#F77249',
      stroke: '#F77249'
    },
    redCalendar: {
      fill: '#FF0000',
      stroke: '#FF0000'
    },
    activeCalendar: {
      fill: 'primary',
      stroke: 'primary'
    }
  };

  const isLongerThan14Days = date && Date.now() - new Date(date).getTime() > 14 * 24 * 60 * 60 * 1000;
  const isLongerThan21Days = date && Date.now() - new Date(date).getTime() > 21 * 24 * 60 * 60 * 1000;
  const isLongerThan28Days = date && Date.now() - new Date(date).getTime() > 28 * 24 * 60 * 60 * 1000;

  const lastVoteDate = date
    ? `LAST VOTED ${isLongerThan14Days ? formatTimeAgo(date) : formatDateWithTime(date)}`
    : 'NO VOTE HISTORY';

  return (
    <Flex
      sx={{
        mb: 1,
        flexDirection: left ? 'row-reverse' : ['row-reverse', 'row'],
        justifyContent: left ? 'flex-end' : 'flex-start',
        alignItems: 'center'
      }}
    >
      <Text variant="caps" color={expired ? '#D8E0E3' : 'onSecondary'} sx={{ mr: 2 }}>
        {lastVoteDate}
      </Text>
      <Flex
        sx={{
          alignContent: 'center',
          mr: 1
        }}
      >
        <Icon
          name="calendar"
          sx={
            expired || !date
              ? styles.expiredCalendar
              : isLongerThan28Days
              ? styles.redCalendar
              : isLongerThan21Days
              ? styles.orangeCalendar
              : isLongerThan14Days
              ? styles.yellowCalendar
              : styles.activeCalendar
          }
        />
      </Flex>
    </Flex>
  );
}
