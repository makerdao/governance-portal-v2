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
        <Flex sx={{ mb: 3, justifyContent: 'space-between', alignItems: 'center' }}>
          <LastVoted
            expired={delegate.expired}
            date={delegate ? (delegate.lastVoteDate ? delegate.lastVoteDate : null) : undefined}
            left
          />
          {delegate.cuMember && <CoreUnitButton handleInfoClick={handleInfoClick} />}
        </Flex>

        <Flex
          sx={{
            flexDirection: 'column'
          }}
        >
          <Flex
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ mr: 2, maxWidth: '155px' }}>
              <DelegateAvatarName delegate={delegate} />
            </Box>

            <Flex
              sx={{
                flexDirection: ['column', 'row'],
                alignItems: 'center'
              }}
            >
              <Button
                variant="primaryOutline"
                disabled={!account}
                onClick={() => {
                  trackButtonClick('openUndelegateModal');
                  setShowUndelegateModal(true);
                }}
                sx={{ width: ['100%', '135px'], height: '45px', maxWidth: '135px', mr: [0, 2], mb: [2, 0] }}
                data-testid="button-undelegate"
              >
                Undelegate
              </Button>
              <Button
                variant="primaryLarge"
                data-testid="button-delegate"
                disabled={!account}
                onClick={() => {
                  trackButtonClick('openDelegateModal');
                  setShowDelegateModal(true);
                }}
                sx={{ width: ['100%', '135px'], maxWidth: '135px', height: '45px', ml: [0, 3] }}
              >
                Delegate
              </Button>
            </Flex>
          </Flex>

          <Flex
            sx={{
              mt: delegate.tags && delegate.tags.length > 0 ? 1 : 3,
              flexDirection: 'column'
            }}
          >
            <Box
              sx={{
                mb: '1'
              }}
            >
              <DelegateTags tags={delegate.tags} />
            </Box>
            <Flex
              sx={{
                flexDirection: ['column', 'row'],
                justifyContent: ['space-between', 'flex-start']
              }}
            >
              <Box sx={{ mr: [0, 3] }}>
                <Tooltip label={participationTooltipLabel}>
                  <Flex sx={{ cursor: 'help', alignItems: 'center' }}>
                    <Icon name="participation" />
                    <Text as="p" variant="caps" color="onSecondary" sx={{ fontSize: 1 }} ml={1}>
                      {`${delegate.combinedParticipation ?? 'Untracked'} Participation`}
                    </Text>
                  </Flex>
                </Tooltip>
              </Box>
              <Box sx={{ mt: [1, 0] }}>
                <Tooltip label={communicationTooltipLabel}>
                  <Flex sx={{ cursor: 'help', alignItems: 'center' }}>
                    <Icon name="comment" />
                    <Text as="p" variant="caps" color="onSecondary" sx={{ fontSize: 1 }} ml={1}>
                      {`${delegate.communication ?? 'Untracked'} Communication`}
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
                <Box>
                  <Text
                    as="p"
                    variant="microHeading"
                    sx={{ fontSize: [3, 5], textAlign: ['left', 'right'] }}
                    data-testid="mkr-delegated-by-you"
                  >
                    {mkrDelegated ? formatValue(mkrDelegated) : '0.00'}
                  </Text>
                  <Text
                    as="p"
                    variant="secondary"
                    color="onSecondary"
                    sx={{ fontSize: [2, 3], textAlign: 'right' }}
                  >
                    MKR delegated by you
                  </Text>
                </Box>
                <Box sx={{ ml: '4' }}>
                  <Text
                    as="p"
                    variant="microHeading"
                    sx={{ fontSize: [3, 5], textAlign: ['left', 'right'] }}
                    data-testid="total-mkr-delegated"
                  >
                    {totalStaked && totalStaked.gt(0) ? formatValue(totalStaked) : '0.00'}
                  </Text>
                  <Text
                    as="p"
                    variant="secondary"
                    color="onSecondary"
                    sx={{ fontSize: [2, 3], textAlign: 'right' }}
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
