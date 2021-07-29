/** @jsx jsx */

import React, { useState } from 'react';
import { Box, Flex, Button, Text, Link as ExternalLink, jsx } from 'theme-ui';
import Link from 'next/link';
import mixpanel from 'mixpanel-browser';
import { getNetwork } from 'lib/maker';
import { useLockedMkr, useMkrDelegated } from 'lib/hooks';
import { limitString } from 'lib/string';
import { getEtherscanLink } from 'lib/utils';
import { DelegateStatusEnum } from 'lib/delegates/constants';
import useAccountsStore from 'stores/accounts';
import { Delegate } from 'types/delegate';
import {
  DelegatePicture,
  DelegateModal,
  UndelegateModal,
  // DelegateLastVoted,
  DelegateContractExpiration
} from 'components/delegations';

type PropTypes = {
  delegate: Delegate;
};

export function DelegateCard({ delegate }: PropTypes): React.ReactElement {
  const network = getNetwork();
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [showUndelegateModal, setShowUndelegateModal] = useState(false);
  const [account, voteDelegate] = useAccountsStore(state => [state.currentAccount, state.voteDelegate]);
  const address = account?.address;

  const { data: totalStaked } = useLockedMkr(delegate.voteDelegateAddress);

  const { data: mkrStaked } = useMkrDelegated(address, delegate.voteDelegateAddress);

  const showLinkToDetail = delegate.status === DelegateStatusEnum.recognized && !delegate.expired;

  const isOwner =
    delegate.voteDelegateAddress.toLowerCase() === voteDelegate?.getVoteDelegateAddress().toLowerCase();

  return (
    <Box sx={{ variant: isOwner ? 'cards.emphasized' : 'cards.primary' }}>
      <Flex sx={{ 
        mb: 3, 
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: ['column', 'column', 'row']
      }}>
        
          <Flex >
            <DelegatePicture delegate={delegate} />

            <Box sx={{ ml: 2 }}>
              <Box>
                <Text variant="microHeading" sx={{ fontSize: [3, 5] }}>
                  {delegate.name ? limitString(delegate.name, 30, '...') : 'Unknown'}
                </Text>
              </Box>
              <ExternalLink
                title="View on etherescan"
                href={getEtherscanLink(getNetwork(), delegate.voteDelegateAddress, 'address')}
                target="_blank"
              >
                <Text>
                  {delegate.voteDelegateAddress.substr(0, 6)}...
                  {delegate.voteDelegateAddress.substr(
                    delegate.voteDelegateAddress.length - 5,
                    delegate.voteDelegateAddress.length - 1
                  )}
                </Text>
              </ExternalLink>
            </Box>
          </Flex>

          <Box >
            {showLinkToDetail && (
              <Link
                href={{
                  pathname: `/delegates/${delegate.voteDelegateAddress}`,
                  query: { network }
                }}
              >
                <a title="Profile details">
                  <Button sx={{ borderColor: 'text', color: 'text' }} variant="outline">
                    View Profile Details
                  </Button>
                </a>
              </Link>
            )}

            {!showLinkToDetail && (
              <Box>
                {/* <DelegateLastVoted delegate={delegate} /> */}
                <DelegateContractExpiration delegate={delegate} />
              </Box>
            )}
          </Box>
       
      </Flex>
      <Flex
        sx={{
          flexDirection: ['column', 'column', 'row', 'column', 'row']
        }}
      >
        

        <Flex
          sx={{
            width: '100%',
            mt: [4, 4, 0, 4, 0],
            mb: [2, 2, 0, 2, 0],
            ml: [2, 2, 0, 2, 0],
            flexDirection: ['row', 'row', 'column-reverse', 'row', 'column-reverse']
          }}
        >
          <Flex
            sx={{
              flexDirection: ['column', 'column', 'row', 'column', 'row'],
              justifyContent: 'space-between',
              width: '100%'
            }}
          >
            <Box sx={{ mb: 4, flex: 1 }}>
              <Text
                as="p"
                variant="microHeading"
                sx={{ fontSize: [3, 5], color: delegate.communication ? 'text' : 'secondaryMuted' }}
              >
                {delegate.combinedParticipation ?? 'Untracked'}
              </Text>
              <Text as="p" variant="secondary" color="onSecondary" sx={{ fontSize: [2, 3] }}>
                Participation
              </Text>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Text
                as="p"
                variant="microHeading"
                sx={{ fontSize: [3, 5], color: delegate.communication ? 'text' : 'secondaryMuted' }}
              >
                {delegate.communication ?? 'Untracked'}
              </Text>
              <Text as="p" variant="secondary" color="onSecondary" sx={{ fontSize: [2, 3] }}>
                Communication
              </Text>
            </Box>
            <Box>
              <Button
                variant="primaryOutline"
                disabled={!account}
                onClick={() => {
                  mixpanel.track('btn-click', {
                    id: 'openUndelegateModal',
                    product: 'governance-portal-v2',
                    page: 'Delegates'
                  });
                  setShowUndelegateModal(true);
                }}
                sx={{ width: '150px', mt: [4, 4, 0, 4, 0] }}
              >
                Undelegate
              </Button>
            </Box>
          </Flex>
          <Flex
            sx={{
              flexDirection: ['column', 'column', 'row', 'column', 'row'],
              justifyContent: 'space-between',
              width: '100%'
            }}
          >
            <Box sx={{ mb: 4, flex: 1 }}>
              <Text as="p" variant="microHeading" sx={{ fontSize: [3, 5] }}>
                {totalStaked ? totalStaked.toBigNumber().toFormat(2) : '0.00'}
              </Text>
              <Text as="p" variant="secondary" color="onSecondary" sx={{ fontSize: [2, 3] }}>
                Total MKR delegated
              </Text>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Text as="p" variant="microHeading" sx={{ fontSize: [3, 5] }}>
                {mkrStaked ? mkrStaked.toBigNumber().toFormat(2) : '0.00'}
              </Text>
              <Text as="p" variant="secondary" color="onSecondary" sx={{ fontSize: [2, 3] }}>
                MKR delegated by you
              </Text>
            </Box>
            <Box>
              <Button
                variant="primaryLarge"
                disabled={!account}
                onClick={() => {
                  mixpanel.track('btn-click', {
                    id: 'openDelegateModal',
                    product: 'governance-portal-v2',
                    page: 'Delegates'
                  });
                  setShowDelegateModal(true);
                }}
                sx={{ width: '150px', mt: [4, 4, 0, 4, 0] }}
              >
                Delegate
              </Button>
            </Box>
          </Flex>
        </Flex>
      </Flex>

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
