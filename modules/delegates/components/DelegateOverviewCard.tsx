/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import React, { useState } from 'react';
import { Card, Box, Flex, Button, Text, Heading } from 'theme-ui';
import SkeletonThemed from 'modules/app/components/SkeletonThemed';
import { formatValue } from 'lib/string';
import { InternalLink } from 'modules/app/components/InternalLink';
import { useMkrDelegated } from 'modules/mkr/hooks/useMkrDelegated';
import { useLockedMkr } from 'modules/mkr/hooks/useLockedMkr';
import { Delegate } from '../types';
import { DelegateModal, UndelegateModal } from 'modules/delegates/components';
import { CurrentlySupportingExecutive } from 'modules/executive/components/CurrentlySupportingExecutive';
import LastVoted from 'modules/polling/components/LastVoted';
import DelegateAvatarName from './DelegateAvatarName';
import { useAccount } from 'modules/app/hooks/useAccount';
import { CoreUnitModal } from './modals/CoreUnitModal';
import { CoreUnitButton } from './modals/CoreUnitButton';
import Icon from 'modules/app/components/Icon';
import { Icon as UIIcon } from '@makerdao/dai-ui-icons';
import DelegateExpiryDate from 'modules/migration/components/DelegateExpiryDate';
import { DialogOverlay, DialogContent } from 'modules/app/components/Dialog';
import BoxWithClose from 'modules/app/components/BoxWithClose';

type PropTypes = {
  delegate: Delegate;
};

const DelegateVotingStatsModal = () => {
  const [overlayOpen, setOverlayOpen] = useState(false);

  return (
    <>
      <Flex onClick={() => setOverlayOpen(true)} sx={{ cursor: 'pointer', ml: 2 }}>
        <UIIcon name="info" color="primary" />
      </Flex>
      {overlayOpen && (
        <DialogOverlay isOpen={overlayOpen} onDismiss={() => setOverlayOpen(false)}>
          <DialogContent ariaLabel="Delegate voting stats info">
            <BoxWithClose close={() => setOverlayOpen(false)}>
              <Flex
                sx={{
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Heading sx={{ mb: 3 }}>Delegate voting stats</Heading>
                <Text as="p" sx={{ mb: 3 }}>
                  - Participation: The percentage of votes the delegate has participated in. It combines stats
                  for polls and executives.
                </Text>
                <Text as="p" sx={{ mb: 3 }}>
                  - Communication: The percentage of votes for which the delegate has publicly communicated
                  their reasoning in addition to voting. It combines stats for polls and executives.
                </Text>
                <Text as="p">Both stats are updated weekly by the GovAlpha Core Unit.</Text>
              </Flex>
            </BoxWithClose>
          </DialogContent>
        </DialogOverlay>
      )}
    </>
  );
};

export function DelegateOverviewCard({ delegate }: PropTypes): React.ReactElement {
  const { account, voteDelegateContractAddress } = useAccount();

  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [showUndelegateModal, setShowUndelegateModal] = useState(false);
  const [showCoreUnitModal, setShowCoreUnitModal] = useState(false);

  const handleInfoClick = () => {
    setShowCoreUnitModal(!showCoreUnitModal);
  };

  const { data: totalStaked, mutate: mutateTotalStaked } = useLockedMkr(delegate.voteDelegateAddress);
  const { data: mkrDelegated, mutate: mutateMKRDelegated } = useMkrDelegated(
    account,
    delegate.voteDelegateAddress
  );
  const hasMkrDelegated = account && mkrDelegated?.gt(0);

  const isOwner = delegate.voteDelegateAddress.toLowerCase() === voteDelegateContractAddress?.toLowerCase();

  return (
    <Card
      sx={{
        p: 0
      }}
      data-testid="delegate-card"
    >
      <Box px={[3, 4]} pb={3} pt={3}>
        <Flex
          sx={{
            flexDirection: ['column', 'row'],
            mb: 2,
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}
        >
          <Flex
            sx={{
              flexDirection: ['column', 'row'],
              justifyContent: 'flex-start'
            }}
          >
            <LastVoted
              expired={delegate.expired}
              date={delegate ? (delegate.lastVoteDate ? delegate.lastVoteDate : null) : undefined}
              left
            />
          </Flex>
          <Flex sx={{ flexDirection: 'column', alignItems: ['flex-start', 'flex-end'], mt: [1, 0] }}>
            <DelegateExpiryDate delegate={delegate} />
            {delegate.cuMember && (
              <Flex sx={{ mt: 1 }}>
                <CoreUnitButton handleInfoClick={handleInfoClick} />
              </Flex>
            )}
          </Flex>
        </Flex>

        <Flex
          sx={{
            flexDirection: 'column'
          }}
        >
          <Flex
            sx={{
              flexDirection: ['column', 'row'],
              alignItems: ['flex-start', 'center'],
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ mr: 2, my: 2 }}>
              <DelegateAvatarName delegate={delegate} />
            </Box>

            <Flex
              sx={{
                flexDirection: 'row',
                alignItems: 'center',
                ml: 2,
                my: 2,
                justifyContent: 'right'
              }}
            >
              {hasMkrDelegated && (
                <Button
                  variant="primaryOutline"
                  disabled={!hasMkrDelegated}
                  onClick={() => {
                    setShowUndelegateModal(true);
                  }}
                  sx={{ width: '135px', height: '45px', maxWidth: '135px', mr: [2, 2] }}
                  data-testid="button-undelegate"
                >
                  Undelegate
                </Button>
              )}
              <Button
                variant="primaryLarge"
                data-testid="button-delegate"
                disabled={!account || !!delegate.next || delegate.expired}
                onClick={() => {
                  setShowDelegateModal(true);
                }}
                sx={{
                  width: '135px',
                  maxWidth: '135px',
                  height: '45px',
                  ml: hasMkrDelegated ? 3 : 0
                }}
              >
                Delegate
              </Button>
            </Flex>
          </Flex>

          <Flex
            sx={{
              mt: delegate.tags && delegate.tags.length > 0 ? 0 : 3,
              flexDirection: 'column'
            }}
          >
            <Box
              sx={{
                mb: delegate.tags && delegate.tags.length > 0 ? 1 : 0
              }}
            ></Box>
            <Flex
              sx={{
                flexDirection: 'row',
                flexWrap: 'wrap'
              }}
            >
              <Box sx={{ mr: 3, mb: 1 }}>
                <Flex sx={{ alignItems: 'center' }}>
                  <Icon name="participation" />
                  <Text as="p" variant="caps" color="onSecondary" sx={{ fontSize: 1 }} ml={1}>
                    {delegate.combinedParticipation === 'No Data'
                      ? 'No Participation Data'
                      : delegate.combinedParticipation
                      ? delegate.combinedParticipation + ' Participation'
                      : 'Untracked Participation'}
                  </Text>
                </Flex>
              </Box>
              <Box>
                <Flex sx={{ alignItems: 'center' }}>
                  <Icon name="comment" />
                  <Text as="p" variant="caps" color="onSecondary" sx={{ fontSize: 1 }} ml={1}>
                    {delegate.communication === 'No Data'
                      ? 'No Communication Data'
                      : delegate.communication
                      ? delegate.communication + ' Communication'
                      : 'Untracked Communication'}
                  </Text>
                </Flex>
              </Box>
              <Box>
                <DelegateVotingStatsModal />
              </Box>
            </Flex>
            <Flex
              sx={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                flexWrap: 'wrap-reverse'
              }}
            >
              <Flex sx={{ height: '100%' }}>
                <InternalLink
                  href={`/address/${delegate.voteDelegateAddress}`}
                  title={`View ${isOwner ? 'Your' : 'Profile'} Details`}
                  styles={{ mt: 'auto' }}
                >
                  <Button
                    variant="outline"
                    sx={{ borderColor: 'text', color: 'text', whiteSpace: 'nowrap', mt: 3, mr: 3 }}
                  >
                    {`View ${isOwner ? 'Your' : 'Profile'} Details`}
                  </Button>
                </InternalLink>
              </Flex>
              <Flex sx={{ justifyContent: 'flex-end', mt: '3' }}>
                {account && (
                  <Box>
                    {mkrDelegated ? (
                      <Text
                        as="p"
                        variant="microHeading"
                        sx={{ fontSize: [3, 5], textAlign: ['left', 'right'] }}
                        data-testid="mkr-delegated-by-you"
                      >
                        {formatValue(mkrDelegated)}
                      </Text>
                    ) : (
                      <SkeletonThemed />
                    )}
                    <Text
                      as="p"
                      variant="secondary"
                      color="onSecondary"
                      sx={{ textAlign: 'right', fontSize: [1, 2, 3] }}
                    >
                      MKR delegated by you
                    </Text>
                  </Box>
                )}
                <Box sx={{ ml: account ? 4 : 0 }}>
                  {totalStaked ? (
                    <Text
                      as="p"
                      variant="microHeading"
                      sx={{ fontSize: [3, 5], textAlign: ['left', 'right'] }}
                      data-testid="total-mkr-delegated"
                    >
                      {formatValue(totalStaked)}
                    </Text>
                  ) : (
                    <SkeletonThemed />
                  )}
                  <Text
                    as="p"
                    variant="secondary"
                    color="onSecondary"
                    sx={{ textAlign: 'right', fontSize: [1, 2, 3] }}
                  >
                    Total MKR delegated
                  </Text>
                </Box>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Box>
      <CurrentlySupportingExecutive
        proposalsSupported={delegate.proposalsSupported}
        execSupported={delegate.execSupported}
      />

      {showDelegateModal && (
        <DelegateModal
          delegate={delegate}
          isOpen={showDelegateModal}
          onDismiss={() => setShowDelegateModal(false)}
          mutateTotalStaked={mutateTotalStaked}
          mutateMKRDelegated={mutateMKRDelegated}
        />
      )}
      {showUndelegateModal && (
        <UndelegateModal
          delegate={delegate}
          isOpen={showUndelegateModal}
          onDismiss={() => setShowUndelegateModal(false)}
          mutateTotalStaked={mutateTotalStaked}
          mutateMKRDelegated={mutateMKRDelegated}
        />
      )}

      {showCoreUnitModal && (
        <CoreUnitModal isOpen={showCoreUnitModal} onDismiss={() => setShowCoreUnitModal(false)} />
      )}
    </Card>
  );
}
