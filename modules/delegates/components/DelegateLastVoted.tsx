import { Delegate } from '../types';
import { Text, Flex } from 'theme-ui';
import React from 'react';
import { formatDateWithTime } from 'lib/datetime';
import Icon from 'modules/app/components/Icon';

export function DelegateLastVoted({
  delegate,
  date,
  left = false
}: {
  delegate: Delegate;
  date?: string;
  left?: boolean;
}): React.ReactElement {
  const styles = {
    expiredCalendar: {
      fill: '#D8E0E3',
      stroke: '#D8E0E3'
    },
    activeCalendar: {
      fill: 'primary',
      stroke: 'primary'
    }
  };

  const lastVoteDate = date ? `LAST VOTED ${formatDateWithTime(date)}` : 'NO VOTE HISTORY';

  return (
    <Flex
      sx={{
        mb: 1,
        flexDirection: left ? 'row-reverse' : ['row-reverse', 'row'],
        justifyContent: left ? 'flex-end': 'flex-start',
        alignItems: 'center'
      }}
    >
      <Text
        variant="secondary"
        color={delegate.expired ? '#D8E0E3' : 'onSecondary'}
        sx={{ textTransform: 'uppercase', fontSize: 1, fontWeight: 'semiBold', mr: 2 }}
      >
        {lastVoteDate}
      </Text>
      <Flex
        sx={{
          alignContent: 'center',
          mr: 1
        }}
      >
        <Icon name="calendar" sx={delegate.expired ? styles.expiredCalendar : styles.activeCalendar} />
      </Flex>
    </Flex>
  );
}
