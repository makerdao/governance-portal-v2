/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import React, { Dispatch, memo, SetStateAction, useState } from 'react';
import { Card, Box, Flex, Button, Text, Heading } from 'theme-ui';
import SkeletonThemed from 'modules/app/components/SkeletonThemed';
import { formatValue } from 'lib/string';
import { InternalLink } from 'modules/app/components/InternalLink';
import { DelegatePaginated } from '../types';
import { DelegateModal, UndelegateModal } from 'modules/delegates/components';
import { useSkyDelegatedByUser } from 'modules/sky/hooks/useSkyDelegatedByUser';
import { CurrentlySupportingExecutive } from 'modules/executive/components/CurrentlySupportingExecutive';
import LastVoted from 'modules/polling/components/LastVoted';
import DelegateAvatarName from './DelegateAvatarName';
import { useAccount } from 'modules/app/hooks/useAccount';
import Icon from 'modules/app/components/Icon';
import { DialogOverlay, DialogContent } from 'modules/app/components/Dialog';
import BoxWithClose from 'modules/app/components/BoxWithClose';
import { parseEther } from 'viem';

type PropTypes = {
  delegate: DelegatePaginated;
  setStateDelegates: Dispatch<SetStateAction<DelegatePaginated[]>>;
  onVisitDelegate: () => void;
};

const DelegateVotingStatsModal = () => {
  const [overlayOpen, setOverlayOpen] = useState(false);

  return (
    <>
      <Flex onClick={() => setOverlayOpen(true)} sx={{ cursor: 'pointer', ml: 2 }}>
        <Icon name="info" color="primary" />
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
                <Text as="p">Both stats are updated weekly by the Governance Facilitators.</Text>
              </Flex>
            </BoxWithClose>
          </DialogContent>
        </DialogOverlay>
      )}
    </>
  );
};

export const DelegateOverviewCard = memo(
  function DelegateOverviewCard({
    delegate,
    setStateDelegates,
    onVisitDelegate
  }: PropTypes): React.ReactElement {
    const { account, voteDelegateContractAddress } = useAccount();

    const [showDelegateModal, setShowDelegateModal] = useState(false);
    const [showUndelegateModal, setShowUndelegateModal] = useState(false);

    const { data: skyDelegatedData, mutate: mutateSkyDelegated } = useSkyDelegatedByUser(
      account,
      delegate.voteDelegateAddress
    );
    const skyDelegated = skyDelegatedData?.totalDelegationAmount;
    const hasSkyDelegated = account && skyDelegated && skyDelegated > 0n;

    const mutateDelegateTotalSky = (amount: bigint) => {
      setStateDelegates(prevDelegates => {
        const mutatedDelegateArray = prevDelegates.map(d => {
          if (d.voteDelegateAddress === delegate.voteDelegateAddress) {
            return {
              ...d,
              skyDelegated: formatValue(parseEther(d.skyDelegated) + amount, 'wad', 2, false)
            };
          }
          return d;
        });

        return mutatedDelegateArray;
      });
    };

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
                date={delegate ? (delegate.lastVoteDate ? delegate.lastVoteDate : null) : undefined}
                left
              />
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
                <DelegateAvatarName delegate={delegate} onVisitDelegate={onVisitDelegate} />
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
                {hasSkyDelegated && (
                  <Button
                    variant="primaryOutline"
                    disabled={!hasSkyDelegated}
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
                  disabled={!account}
                  onClick={() => {
                    setShowDelegateModal(true);
                  }}
                  sx={{
                    width: '135px',
                    maxWidth: '135px',
                    height: '45px',
                    ml: hasSkyDelegated ? 3 : 0
                  }}
                >
                  Delegate SKY
                </Button>
              </Flex>
            </Flex>

            <Flex sx={{ mt: 3, flexDirection: 'column' }}>
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
                      onClick={() => onVisitDelegate()}
                    >
                      {`View ${isOwner ? 'Your' : 'Profile'} Details`}
                    </Button>
                  </InternalLink>
                </Flex>
                <Flex sx={{ justifyContent: 'flex-end', mt: '3' }}>
                  {account && (
                    <Box>
                      {typeof skyDelegated === 'bigint' ? (
                        <Text
                          as="p"
                          variant="microHeading"
                          sx={{ fontSize: [3, 5], textAlign: ['left', 'right'] }}
                          data-testid="sky-delegated-by-you"
                        >
                          {formatValue(skyDelegated)}
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
                        SKY delegated by you
                      </Text>
                    </Box>
                  )}
                  <Box sx={{ ml: account ? 4 : 0 }}>
                    <Text
                      as="p"
                      variant="microHeading"
                      sx={{ fontSize: [3, 5], textAlign: ['left', 'right'] }}
                      data-testid="total-sky-delegated"
                    >
                      {formatValue(parseEther(delegate.skyDelegated), 'wad')}
                    </Text>
                    <Text
                      as="p"
                      variant="secondary"
                      color="onSecondary"
                      sx={{ textAlign: 'right', fontSize: [1, 2, 3] }}
                    >
                      Total SKY delegated
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
          delegateAddress={delegate.voteDelegateAddress}
        />

        {showDelegateModal && (
          <DelegateModal
            delegate={delegate}
            isOpen={showDelegateModal}
            onDismiss={() => setShowDelegateModal(false)}
            mutateTotalStaked={mutateDelegateTotalSky}
            mutateSkyDelegated={mutateSkyDelegated}
            refetchOnDelegation={false}
          />
        )}
        {showUndelegateModal && (
          <UndelegateModal
            delegate={delegate}
            isOpen={showUndelegateModal}
            onDismiss={() => setShowUndelegateModal(false)}
            mutateTotalStaked={mutateDelegateTotalSky}
            mutateSkyDelegated={mutateSkyDelegated}
            refetchOnDelegation={false}
          />
        )}
      </Card>
    );
  },
  ({ delegate: prevDelegate }, { delegate: nextDelegate }) => Object.is(prevDelegate, nextDelegate)
);
