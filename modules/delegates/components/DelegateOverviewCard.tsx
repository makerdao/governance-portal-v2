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
        p: [0, 0]
      }}
      data-testid="delegate-card"
    >
      <Box px={[3, 4]} pb={[3, 4]} pt={3}>
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
            flexDirection: ['column', 'column', 'row', 'column', 'row']
          }}
        >
          <Flex
            sx={{
              maxWidth: ['100%', '100%', '300px', '100%', '300px'],
              flex: 1,
              flexDirection: 'column'
            }}
          >
            <Box sx={{ mr: [0, 2] }}>
              <DelegateAvatarName delegate={delegate} />
            </Box>

            <Flex sx={{ height: '100%', mt: [3, 3, 0, 3, 0] }}>
              <InternalLink
                href={`/address/${delegate.voteDelegateAddress}`}
                title={`View ${isOwner ? 'Your' : 'Profile'} Details`}
                styles={{ mt: 'auto' }}
              >
                <Button
                  variant="outline"
                  onClick={() => trackButtonClick('openDelegateProfile')}
                  sx={{ borderColor: 'text', color: 'text', mt: [0, 0, 3, 0, 3] }}
                >
                  {`View ${isOwner ? 'Your' : 'Profile'} Details`}
                </Button>
              </InternalLink>
            </Flex>
          </Flex>

          <Flex
            sx={{
              flex: 1,
              mt: [4, 4, 0, 4, 0],
              mb: [2, 2, 0, 2, 0],
              flexDirection: ['row', 'row', 'column-reverse', 'row', 'column-reverse']
            }}
          >
            <Flex
              sx={{
                flexDirection: ['column', 'column', 'row', 'column', 'row'],
                justifyContent: 'space-between',
                width: ['50%', '100%'],
                mr: [1, 0]
              }}
            >
              <Box sx={{ mb: [3, 3, 0, 3, 0], width: ['auto', '200px'] }}>
                <Text
                  as="p"
                  variant="microHeading"
                  sx={{ fontSize: [3, 5], color: delegate.communication ? 'text' : 'secondaryMuted' }}
                >
                  {delegate.combinedParticipation ?? 'Untracked'}
                </Text>
                <Tooltip label={participationTooltipLabel}>
                  <Text
                    as="p"
                    variant="secondary"
                    color="onSecondary"
                    sx={{ fontSize: [2, 3], cursor: 'help' }}
                  >
                    Participation
                  </Text>
                </Tooltip>
              </Box>
              <Box sx={{ width: ['auto', '200px'] }}>
                <Text
                  as="p"
                  variant="microHeading"
                  sx={{ fontSize: [3, 5], color: delegate.communication ? 'text' : 'secondaryMuted' }}
                >
                  {delegate.communication ?? 'Untracked'}
                </Text>
                <Tooltip label={communicationTooltipLabel}>
                  <Text
                    as="p"
                    variant="secondary"
                    color="onSecondary"
                    sx={{ fontSize: [2, 3], cursor: 'help' }}
                  >
                    Communication
                  </Text>
                </Tooltip>
              </Box>
              <Box>
                <Button
                  variant="primaryOutline"
                  disabled={!account}
                  onClick={() => {
                    trackButtonClick('openUndelegateModal');
                    setShowUndelegateModal(true);
                  }}
                  sx={{ width: ['100%', '150px'], height: '45px', maxWidth: '150px', mt: [4, 4, 0, 4, 0] }}
                  data-testid="button-undelegate"
                >
                  Undelegate
                </Button>
              </Box>
            </Flex>
            <Flex
              sx={{
                flexDirection: ['column', 'column', 'row', 'column', 'row'],
                justifyContent: 'space-between',
                width: ['50%', '100%'],
                mb: [0, 0, 3, 0, 3]
              }}
            >
              <Box sx={{ mb: [3, 3, 0, 3, 0], width: ['auto', '200px'] }}>
                <Text
                  as="p"
                  variant="microHeading"
                  sx={{ fontSize: [3, 5] }}
                  data-testid="total-mkr-delegated"
                >
                  {totalStaked ? formatValue(totalStaked) : '0.00'}
                </Text>
                <Text as="p" variant="secondary" color="onSecondary" sx={{ fontSize: [2, 3] }}>
                  Total MKR delegated
                </Text>
              </Box>
              <Box sx={{ width: ['auto', '200px'] }}>
                <Text
                  as="p"
                  variant="microHeading"
                  sx={{ fontSize: [3, 5] }}
                  data-testid="mkr-delegated-by-you"
                >
                  {mkrDelegated ? formatValue(mkrDelegated) : '0.00'}
                </Text>
                <Text as="p" variant="secondary" color="onSecondary" sx={{ fontSize: [2, 3] }}>
                  MKR delegated by you
                </Text>
              </Box>
              <Box>
                <Button
                  variant="primaryLarge"
                  data-testid="button-delegate"
                  disabled={!account}
                  onClick={() => {
                    trackButtonClick('openDelegateModal');
                    setShowDelegateModal(true);
                  }}
                  sx={{ width: ['100%', '150px'], maxWidth: '150px', height: '45px', mt: [4, 4, 0, 4, 0] }}
                >
                  Delegate
                </Button>
              </Box>
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
