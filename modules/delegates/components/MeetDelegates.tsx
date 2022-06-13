import { Text, Flex, Button, Heading, Card, get } from 'theme-ui';
import { InternalLink } from 'modules/app/components/InternalLink';
import { Delegate } from '../types';
import DelegateAvatarName from './DelegateAvatarName';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import { ViewMore } from 'modules/home/components/ViewMore';
import VideoModal from 'modules/app/components/VideoModal';
import { useState } from 'react';
import { PlayButton } from 'modules/home/components/PlayButton';
import { MEET_DELEGATE_URLS } from '../delegates.constants';

const MeetDelegateCard = ({
  delegate,
  trackButtonClick,
  bpi,
  setDelegateToPlay
}: {
  delegate: Delegate;
  trackButtonClick: (string) => void;
  bpi: number;
  setDelegateToPlay: (boolean) => void;
}) => {
  return (
    <Card
      sx={{
        minWidth: ['293px', 8],
        border: 'none',
        py: 4,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 3
      }}
    >
      <DelegateAvatarName delegate={delegate} />
      <ParticipationBreakdown delegate={delegate} bpi={bpi} />
      <Flex
        sx={{
          justifyContent: 'space-between',
          flexDirection: bpi === 0 ? 'column' : 'row',
          gap: 3
        }}
      >
        <InternalLink href={`/address/${delegate.voteDelegateAddress}`} title="View delegate profile details">
          <Button
            variant="outline"
            sx={{
              minWidth: '186px',
              borderRadius: 'round',
              ':hover': {
                color: 'text',
                borderColor: 'onSecondary',
                backgroundColor: 'background'
              }
            }}
            onClick={() => trackButtonClick('viewDelegateDetails')}
          >
            View Profile Details
          </Button>
        </InternalLink>

        <Flex>
          <PlayButton
            label="Meet the Delegate"
            onClick={() => setDelegateToPlay(delegate.id)}
            disabled={!MEET_DELEGATE_URLS[delegate.id]}
          />
        </Flex>
      </Flex>
    </Card>
  );
};

export const ParticipationBreakdown = ({
  delegate,
  bpi
}: {
  delegate: Delegate;
  bpi: number;
}): React.ReactElement => {
  return (
    <Flex sx={{ flexDirection: 'column' }}>
      <Text as="p" variant="secondary">
        Participation Breakdown
      </Text>
      <Flex
        sx={{ justifyContent: 'space-between', flexDirection: bpi === 0 ? 'column' : 'row', mt: 1, gap: 2 }}
      >
        <Flex sx={{ flexDirection: 'column' }}>
          <Text as="p" sx={{ fontWeight: 'semiBold' }}>
            {delegate.pollParticipation || 'Untracked'}
          </Text>
          <Text as="p" sx={{ fontSize: 2 }}>
            Poll Participation
          </Text>
        </Flex>
        <Flex sx={{ flexDirection: 'column' }}>
          <Text as="p" sx={{ fontWeight: 'semiBold' }}>
            {delegate.executiveParticipation || 'Untracked'}
          </Text>
          <Text as="p" sx={{ fontSize: 2 }}>
            Executive Participation
          </Text>
        </Flex>
        <Flex sx={{ flexDirection: 'column' }}>
          <Text as="p" sx={{ fontWeight: 'semiBold' }}>
            {delegate.communication || 'Untracked'}
          </Text>
          <Text as="p" sx={{ fontSize: 2 }}>
            Communication
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default function MeetYourDelegates({
  delegates,
  bpi
}: {
  delegates: Delegate[];
  bpi: number;
}): React.ReactElement {
  const [delegateToPlay, setDelegateToPlay] = useState();
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.MEET_DELEGATES);

  return (
    <>
      {delegateToPlay && (
        <VideoModal
          isOpen={delegateToPlay}
          url={MEET_DELEGATE_URLS[delegateToPlay]}
          onDismiss={() => setDelegateToPlay(undefined)}
        />
      )}
      <Flex
        sx={{
          flexDirection: 'column',
          width: '100vw',
          ml: theme => [
            `calc(${get(theme, 'sizes.3')}px * -1)`,
            `calc(${get(theme, 'sizes.4')}px * -1)`,
            `calc(${get(theme, 'sizes.4')}px * -1)`,
            `calc(${get(theme, 'sizes.4')}px * -1)`,
            `calc( calc(${get(theme, 'sizes.page')}px / 2) - 100vw / 2)`
          ],
          gap: 2
        }}
      >
        <Flex
          sx={{
            flexDirection: 'column',
            px: theme => [3, 4, 4, 4, `calc( calc( 100vw - ${get(theme, 'sizes.page')}px) / 2)`],
            gap: 2
          }}
        >
          <Flex sx={{ maxWidth: 'page' }}>
            <Heading>Meet the Delegates</Heading>
            <Flex sx={{ flex: 1, justifyContent: 'flex-end' }}>
              <InternalLink href="/delegates" title="View All Delegates">
                <ViewMore label="View All" />
              </InternalLink>
            </Flex>
          </Flex>
          <Text variant="smallText" sx={{ color: 'textMuted', width: ['100%', '100%', '50%'] }}>
            Vote delegation allows for MKR holders to delegate their voting power to delegates, which
            increases the effectiveness and efficiency of the governance process.
          </Text>
        </Flex>
        <Flex
          sx={{
            gap: [4, 5],
            pb: 5,
            pt: 3,
            overflowX: 'auto',
            pl: theme => [3, 4, 4, 4, `calc( calc( 100vw - ${get(theme, 'sizes.page')}px) / 2)`],
            '::-webkit-scrollbar': {
              display: 'none'
            }
          }}
        >
          {delegates.map(delegate => (
            <MeetDelegateCard
              key={delegate.name}
              delegate={delegate}
              trackButtonClick={trackButtonClick}
              bpi={bpi}
              setDelegateToPlay={setDelegateToPlay}
            />
          ))}
        </Flex>
      </Flex>
    </>
  );
}
