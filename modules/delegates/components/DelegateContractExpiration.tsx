/** @jsx jsx */

import { Delegate } from '../types';
import { Text, Flex, jsx } from 'theme-ui';
import React from 'react';
import Icon from 'components/Icon';
import moment from 'moment';

export function DelegateContractExpiration({ delegate }: { delegate: Delegate }): React.ReactElement {
  const styles = {
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
    <Flex
      sx={{
        alignItems: 'center'
      }}
    >
      <Text
        variant="secondary"
        color="onSecondary"
        sx={{ textTransform: 'uppercase', fontSize: 1, fontWeight: 'semiBold', mr: 2 }}
      >
        {delegate.expired ? 'CONTRACT DELEGATION EXPIRED' : ` EXPIRES ${expiryDate.format(dateFormat)}`}
      </Text>
      <Flex
        sx={{
          alignContent: 'center',
          marginRight: 1
        }}
      >
        <Icon name="calendarcross" sx={delegate.expired ? styles.expiredIcon : styles.activeIcon} />
      </Flex>
    </Flex>
  );
}
