import React, { useState } from 'react';
import { Card, Box, Flex, Button, Text } from 'theme-ui';
import { formatValue } from 'lib/string';
import { InternalLink } from 'modules/app/components/InternalLink';
import { useMkrDelegated } from 'modules/mkr/hooks/useMkrDelegated';
import { useLockedMkr } from 'modules/mkr/hooks/useLockedMkr';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { Delegate } from '../types';
import { DelegateModal, UndelegateModal } from 'modules/delegates/components';
import {
  participationTooltipLabel,
  communicationTooltipLabel
} from 'modules/delegates/components/DelegateParticipationMetrics';
import Tooltip from 'modules/app/components/Tooltip';
import { CurrentlySupportingExecutive } from 'modules/executive/components/CurrentlySupportingExecutive';
import LastVoted from 'modules/polling/components/LastVoted';
import DelegateAvatarName from './DelegateAvatarName';
import { useAccount } from 'modules/app/hooks/useAccount';
import { CoreUnitModal } from './modals/CoreUnitModal';
import { CoreUnitButton } from './modals/CoreUnitButton';
import DelegateTags from './DelegateTags';
import Icon from 'modules/app/components/Icon';
import DelegateExpiryDate from 'modules/migration/components/DelegateExpiryDate';

type PropTypes = {
  delegate: Delegate;
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

  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.DELEGATES);

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
                    trackButtonClick('openUndelegateModal');
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
                  trackButtonClick('openDelegateModal');
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
            >
              <DelegateTags tags={delegate.tags.slice(0, 3)} />
            </Box>
            <Flex
              sx={{
                flexDirection: 'row',
                flexWrap: 'wrap'
              }}
            >
              <Box sx={{ mr: 3, mb: 1 }}>
                <Tooltip label={participationTooltipLabel}>
                  <Flex sx={{ cursor: 'help', alignItems: 'center' }}>
                    <Icon name="participation" />
                    <Text as="p" variant="caps" color="onSecondary" sx={{ fontSize: 1 }} ml={1}>
                      {delegate.combinedParticipation === 'No Data'
                        ? 'No Participation Data'
                        : delegate.combinedParticipation
                        ? delegate.combinedParticipation + ' Participation'
                        : 'Untracked Participation'}
                    </Text>
                  </Flex>
                </Tooltip>
              </Box>
              <Box>
                <Tooltip label={communicationTooltipLabel}>
                  <Flex sx={{ cursor: 'help', alignItems: 'center' }}>
                    <Icon name="comment" />
                    <Text as="p" variant="caps" color="onSecondary" sx={{ fontSize: 1 }} ml={1}>
                      {delegate.communication === 'No Data'
                        ? 'No Communication Data'
                        : delegate.communication
                        ? delegate.communication + ' Communication'
                        : 'Untracked Communication'}
                    </Text>
                  </Flex>
                </Tooltip>
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
                    onClick={() => trackButtonClick('openDelegateProfile')}
                    sx={{ borderColor: 'text', color: 'text', whiteSpace: 'nowrap', mt: 3, mr: 3 }}
                  >
                    {`View ${isOwner ? 'Your' : 'Profile'} Details`}
                  </Button>
                </InternalLink>
              </Flex>
              <Flex sx={{ justifyContent: 'flex-end', mt: '3' }}>
                {account && (
                  <Box>
                    <Text
                      as="p"
                      variant="microHeading"
                      sx={{ fontSize: [3, 5], textAlign: ['left', 'right'] }}
                      data-testid="mkr-delegated-by-you"
                    >
                      {mkrDelegated ? formatValue(mkrDelegated) : '0'}
                    </Text>
                    <Text as="p" variant="secondary" color="onSecondary" sx={{ textAlign: 'right' }}>
                      MKR delegated by you
                    </Text>
                  </Box>
                )}
                <Box sx={{ ml: account ? 4 : 0 }}>
                  <Text
                    as="p"
                    variant="microHeading"
                    sx={{ fontSize: [3, 5], textAlign: ['left', 'right'] }}
                    data-testid="total-mkr-delegated"
                  >
                    {totalStaked && totalStaked.gt(0) ? formatValue(totalStaked) : '0'}
                  </Text>
                  <Text as="p" variant="secondary" color="onSecondary" sx={{ textAlign: 'right' }}>
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
