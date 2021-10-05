/** @jsx jsx */

import { Delegate } from '../types';
import { Text, Flex, jsx } from 'theme-ui';
import React from 'react';
import { format } from 'date-fns';
import Icon from 'components/Icon';

export function DelegateLastVoted({
  delegate,
  date
}: {
  delegate: Delegate;
  date?: string;
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

  const lastVoteDate = date
    ? `LAST VOTED ${format(new Date(date), 'MMM dd yyyy HH:mm zz')}`
    : 'NO VOTE HISTORY';

  return (
    <Flex
      sx={{
        mb: 1,
        flexDirection: ['row-reverse', 'row']
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
