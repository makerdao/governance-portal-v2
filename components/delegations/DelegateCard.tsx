/** @jsx jsx */

import { Box, Button, Grid, Text, Link as ExternalLink, jsx } from 'theme-ui';
import React from 'react';
import useSWR from 'swr';
import getMaker, { getNetwork, MKR } from 'lib/maker';
import useAccountsStore from 'stores/accounts';
import { Delegate } from 'types/delegate';
import { getEtherscanLink } from 'lib/utils';
import DelegatePicture from './DelegatePicture';
import Link from 'next/link';
import { useState } from 'react';
import DelegateModal from './modals/DelegateModal';
import UndelegateModal from './modals/UndelegateModal';
import { limitString } from 'lib/string';
import { DelegateStatusEnum } from 'lib/delegates/constants';
import Icon from 'components/Icon';
import moment from 'moment';

type PropTypes = {
  delegate: Delegate;
};

export default function DelegateCard({ delegate }: PropTypes): React.ReactElement {
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [showUndelegateModal, setShowUndelegateModal] = useState(false);
  const account = useAccountsStore(state => state.currentAccount);
  const address = account?.address;
  const delegateAddress = delegate.address;

  const { data: mkrBalance } = useSWR(['/user/mkr-balance', address], (_, address) =>
    getMaker().then(maker => maker.getToken(MKR).balanceOf(address))
  );

  const { data: mkrStaked, error } = useSWR(
    ['/user/mkr-delegated', delegateAddress, address],
    async (_, delegateAddress, address) => {
      const maker = await getMaker();

      const balance = await maker
        .service('voteDelegate')
        .getStakedBalanceForAddress(delegateAddress, address)
        .then(MKR.wei);

      return balance;
    }
  );

  const styles = {
    dateWrapper: {
      display: 'flex',
      alignItems: 'center'
    },
    dateIcon: {
      display: 'flex',
      alignContent: 'center',
      marginRight: 1
    }
  };

  const dateFormat = 'MMM DD YYYY HH:mm zz';
  const expiryDate = moment(delegate.contractExpireDate);

  return (
    <Box sx={{ variant: 'cards.primary' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Box>
          <Box sx={{ display: 'flex' }}>
            <DelegatePicture delegate={delegate} />

            <Box sx={{ ml: 2 }}>
              <Text variant="microHeading" sx={{ fontSize: [3, 5], maxWidth: '250px' }}>
                {delegate.name ? limitString(delegate.name, 16, '...') : 'Unknown'}
              </Text>
              <ExternalLink
                title="View on etherescan"
                href={getEtherscanLink(getNetwork(), delegate.address, 'address')}
                target="_blank"
              >
                <Text>
                  {delegate.address.substr(0, 6)}...
                  {delegate.address.substr(delegate.address.length - 5, delegate.address.length - 1)}
                </Text>
              </ExternalLink>
            </Box>
          </Box>

          <Box sx={{ mt: 3 }}>
            {delegate.status === DelegateStatusEnum.active && !delegate.expired &&(
              <Link href={`/delegates/${delegate.address}`}>
                <a title="Profile details">
                  <Button sx={{ borderColor: 'text', width: '169px', color: 'text' }} variant="outline">
                    View Profile Details
                  </Button>
                </a>
              </Link>
            )}

            {delegate.status === DelegateStatusEnum.unrecognized && !delegate.expired && (
              <Box>
                <Box sx={styles.dateWrapper}>
                  <Box sx={styles.dateIcon}>
                    <Icon name="calendar" sx={{ fill: 'primary', stroke: 'primary' }} />
                  </Box>
                  <Text variant="secondary" color="onSecondary" sx={{ textTransform: 'uppercase' }}>
                    LAST VOTED {delegate.lastVote.toDateString()}
                  </Text>
                </Box>
                <Box sx={styles.dateWrapper}>
                  <Box sx={styles.dateIcon}>
                    <Icon name="calendarcross" sx={{ fill: 'primary', stroke: 'primary' }} />
                  </Box>
                  <Text variant="secondary" color="onSecondary" sx={{ textTransform: 'uppercase' }}>
                    EXPIRES {expiryDate.format(dateFormat)}
                  </Text>
                </Box>
              </Box>
            )}

            {delegate.expired && (
              <Box>
                <Box sx={styles.dateWrapper}>
                  <Box sx={styles.dateIcon}>
                    <Icon name="calendar" sx={{ fill: '#D8E0E3', stroke: '#D8E0E3' }} />
                  </Box>
                  <Text variant="secondary" color="#D8E0E3" sx={{ textTransform: 'uppercase' }}>
                    LAST VOTED {delegate.lastVote.toDateString()}
                  </Text>
                </Box>
                <Box sx={styles.dateWrapper}>
                  <Box sx={styles.dateIcon}>
                    <Icon name="calendarcross" sx={{ fill: 'error', stroke: 'error' }} />
                  </Box>
                  <Text variant="secondary" color="onSecondary" sx={{ textTransform: 'uppercase' }}>
                    CONTRACT DELEGATION EXPIRED
                  </Text>
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        <Box>
          <Grid columns={3}>
            <Box sx={{ mr: 4 }}>
              <Box sx={{ mb: 3 }}>
                <Text variant="microHeading" sx={{ fontSize: [3, 5] }}>
                  {mkrStaked ? mkrStaked.toBigNumber().toFormat(2) : '0.00'}
                </Text>
                <Text variant="secondary" color="onSecondary">
                  Total MKR delegated
                </Text>
              </Box>
              <Box>
                <Text variant="microHeading" sx={{ fontSize: [3, 5] }}>
                  0.51%
                </Text>
                <Text variant="secondary" color="onSecondary">
                  Pool participation
                </Text>
              </Box>
            </Box>

            <Box sx={{ mr: 4 }}>
              <Box sx={{ mb: 3 }}>
                <Text variant="microHeading" sx={{ fontSize: [3, 5] }}>
                  {mkrBalance ? mkrBalance.toBigNumber().toFormat(2) : '0.00'}
                </Text>
                <Text variant="secondary" color="onSecondary">
                  MKR delegated by you
                </Text>
              </Box>
              <Box>
                <Text variant="microHeading" sx={{ fontSize: [3, 5] }}>
                  23.23%
                </Text>
                <Text variant="secondary" color="onSecondary">
                  Executive participation
                </Text>
              </Box>
            </Box>

            {account && (
              <Box sx={{ textAlign: 'right' }}>
                <Box sx={{ mb: 3 }}>
                  <Button
                    variant="primaryLarge"
                    onClick={() => setShowDelegateModal(true)}
                    sx={{ width: '150px' }}
                  >
                    Delegate
                  </Button>
                </Box>
                <Box>
                  <Button
                    variant="primaryOutline"
                    onClick={() => setShowUndelegateModal(true)}
                    sx={{ width: '150px' }}
                  >
                    Undelegate
                  </Button>
                </Box>
              </Box>
            )}
          </Grid>
        </Box>
      </Box>

      {/* TODO: consider using same component for both delegate + undelegate */}
      <DelegateModal
        delegate={delegate}
        isOpen={showDelegateModal}
        onDismiss={() => setShowDelegateModal(false)}
      />
      <UndelegateModal
        delegate={delegate}
        isOpen={showUndelegateModal}
        onDismiss={() => setShowUndelegateModal(false)}
      />
    </Box>
  );
}
