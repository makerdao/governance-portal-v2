import { Text, Flex } from 'theme-ui';
import React from 'react';
import Icon from 'modules/app/components/Icon';
import { DateWithHover } from 'modules/app/components/DateWithHover';
import { Delegate } from 'modules/delegates/types';

export default function DelegateExpiryDate({ delegate }: { delegate: Delegate }): React.ReactElement {
  const iconStyles = {
    orangeCalendar: {
      fill: '#F75524',
      stroke: '#F75524'
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

  return (
    <Flex
      sx={{
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        height: '18px'
      }}
    >
      <Text
        variant="caps"
        color={
          delegate.expired
            ? iconStyles.redCalendar.fill
            : delegate.isAboutToExpire
            ? 'warning'
            : 'onSecondary'
        }
        sx={{ mr: 2 }}
      >
        <Flex>
          <Text sx={{ mr: 1 }}>
            {delegate.expired ? 'EXPIRED' : delegate.isAboutToExpire ? 'ABOUT TO EXPIRE' : 'RENEWED'}
          </Text>{' '}
          <DateWithHover
            date={
              delegate.expired || delegate.isAboutToExpire
                ? delegate.expirationDate
                : new Date(delegate.blockTimestamp)
            }
          />
        </Flex>
      </Text>
      <Flex
        sx={{
          alignContent: 'center',
          mr: [1, 0]
        }}
      >
        <Icon
          name="calendar"
          sx={
            delegate.expired
              ? iconStyles.redCalendar
              : delegate.isAboutToExpire
              ? iconStyles.orangeCalendar
              : iconStyles.activeCalendar
          }
        />
      </Flex>
    </Flex>
  );
}
