import React, { useState } from 'react';
import { Card, Box, Flex, Button, Text, Link as ThemeUILink } from 'theme-ui';
import Link from 'next/link';
import { formatValue } from 'lib/string';
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
import SkeletonThemed from 'modules/app/components/SkeletonThemed';
import LastVoted from 'modules/polling/components/LastVoted';
import DelegateAvatarName from './DelegateAvatarName';
import { useAccount } from 'modules/app/hooks/useAccount';

type PropTypes = {
  delegate: Delegate;
};

export function DelegateCard({ delegate }: PropTypes): React.ReactElement {
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [showUndelegateModal, setShowUndelegateModal] = useState(false);
  const { account, voteDelegateContractAddress } = useAccount();

  const { data: totalStaked, mutate: mutateTotalStaked } = useLockedMkr(delegate.voteDelegateAddress);
  const { data: mkrDelegated, mutate: mutateMKRDelegated } = useMkrDelegated(
    account,
    delegate.voteDelegateAddress
  );

  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.DELEGATES);

  const isOwner = delegate.voteDelegateAddress.toLowerCase() === voteDelegateContractAddress?.toLowerCase();

  const lastVote = delegate.pollVoteHistory.sort((a, b) => (a.blockTimestamp > b.blockTimestamp ? -1 : 1))[0];

  return (
    <Card
      sx={{
        p: [0, 0],
        borderColor: isOwner ? 'onSecondary' : 'muted'
      }}
      data-testid="delegate-card"
    >
      <Box px={[3, 4]} pb={[3, 4]} pt={3}>
        <Box mb={2}>
          {delegate.pollVoteHistory && (
            <LastVoted expired={delegate.expired} date={lastVote ? lastVote.blockTimestamp : null} left />
          )}
          {!delegate.pollVoteHistory && <SkeletonThemed width={'200px'} height={'15px'} />}
        </Box>
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
            <Link
              href={{
                pathname: `/address/${delegate.voteDelegateAddress}`
              }}
              passHref
            >
              <ThemeUILink title="Profile details" variant="nostyle">
                <Box sx={{ mr: [0, 2] }}>
                  <DelegateAvatarName delegate={delegate} isOwner={isOwner} />
                </Box>
              </ThemeUILink>
            </Link>

            <Flex sx={{ height: '100%', mt: [3, 3, 0, 3, 0] }}>
              <Link
                href={{
                  pathname: `/address/${delegate.voteDelegateAddress}`
                }}
              >
                <a sx={{ mt: 'auto' }} title="Profile details">
                  <Button
                    onClick={() => trackButtonClick('openDelegateProfile')}
                    sx={{ borderColor: 'text', color: 'text' }}
                    variant="outline"
                  >
                    {`View ${isOwner ? 'Your' : 'Profile'} Details`}
                  </Button>
                </a>
              </Link>
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
                  {totalStaked ? formatValue(totalStaked) : '0.000'}
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
                  {mkrDelegated ? formatValue(mkrDelegated) : '0.000'}
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
    </Card>
  );
}
