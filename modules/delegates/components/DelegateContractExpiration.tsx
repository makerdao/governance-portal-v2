/** @jsx jsx */

import { Delegate } from '../types';
import { Text, Flex, jsx } from 'theme-ui';
import React from 'react';
import { format } from 'date-fns';
import Icon from 'components/Icon';

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

  const expiryDate = format(new Date(delegate.expirationDate), 'MMM dd yyyy HH:mm zz');

  return (
    <Flex
      sx={{
        alignItems: 'center',
        flexDirection: ['row-reverse', 'row']
      }}
    >
      <Text
        variant="secondary"
        color="onSecondary"
        sx={{ textTransform: 'uppercase', fontSize: 1, fontWeight: 'semiBold', mr: 2 }}
      >
        {delegate.expired ? 'CONTRACT DELEGATION EXPIRED' : ` EXPIRES ${expiryDate}`}
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
