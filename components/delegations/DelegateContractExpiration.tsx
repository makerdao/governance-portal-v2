import { Delegate } from 'types/delegate';
/** @jsx jsx */

import { Box, Text, jsx } from 'theme-ui';
import React from 'react';
import Icon from 'components/Icon';
import moment from 'moment';

export function DelegateContractExpiration({ delegate }: { delegate: Delegate }): React.ReactElement {
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
    expiredIcon: {
      fill: 'error',
      stroke: 'error'
    },
    activeIcon: {
      fill: 'primary',
      stroke: 'primary'
    }
  };

  const dateFormat = 'MMM DD YYYY HH:mm zz';
  const expiryDate = moment(delegate.expirationDate);

  return (
    <Box sx={styles.itemWrapper}>
      <Box sx={styles.dateIcon}>
        <Icon name="calendarcross" sx={delegate.expired ? styles.expiredIcon : styles.activeIcon} />
      </Box>
      <Text
        variant="secondary"
        color="onSecondary"
        sx={{ textTransform: 'uppercase', fontSize: 1, fontWeight: 'semiBold', ml: 1 }}
      >
        {delegate.expired ? 'CONTRACT DELEGATION EXPIRED' : ` EXPIRES ${expiryDate.format(dateFormat)}`}
      </Text>
    </Box>
  );
}
