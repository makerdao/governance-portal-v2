import { Delegate } from 'types/delegate';
/** @jsx jsx */

import { Box, Text, jsx } from 'theme-ui';
import React from 'react';
import Icon from 'components/Icon';
import moment from 'moment';

export function DelegateLastVoted({ delegate }: { delegate: Delegate }): React.ReactElement {
  const styles = {
    itemWrapper: {
      display: 'flex',
      alignItems: 'center',
      mb: 1
    },
    dateIcon: {
      display: 'flex',
      alignContent: 'center',
      marginRight: 1
    },

    expiredCalendar: {
      fill: 'primary',
      stroke: 'primary'
    },

    activeCalendar: {
      fill: '#D8E0E3',
      stroke: '#D8E0E3'
    }
  };

  const dateFormat = 'MMM DD YYYY HH:mm zz';
  const lastVoteDate = moment(delegate.lastVote);

  return (
    <Box sx={styles.itemWrapper}>
      <Box sx={styles.dateIcon}>
        <Icon name="calendar" sx={delegate.expired ? styles.expiredCalendar : styles.activeCalendar} />
      </Box>
      <Text
        variant="secondary"
        color={delegate.expired ? '#D8E0E3' : 'onSecondary'}
        sx={{ textTransform: 'uppercase', fontSize: 1, fontWeight: 'semiBold', ml: 1 }}
      >
        LAST VOTED {lastVoteDate.format(dateFormat)}
      </Text>
    </Box>
  );
}
