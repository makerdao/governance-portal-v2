import { Text, Flex, Button, Heading, Card } from 'theme-ui';
import { InternalLink } from 'modules/app/components/InternalLink';
import { Delegate } from '../types';
import DelegateAvatarName from './DelegateAvatarName';
// import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
// import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import { Icon } from '@makerdao/dai-ui-icons';
import { ViewMore } from 'modules/home/components/ViewMore';

export const ParticipationBreakdown = ({ delegate }: { delegate: Delegate }): React.ReactElement => {
  return (
    <Flex sx={{ flexDirection: 'column', py: 3 }}>
      <Text as="p" variant="secondary">
        Participation Breakdown
      </Text>
      <Flex sx={{ justifyContent: 'space-between', mt: 2 }}>
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

export default function MeetYourDelegates({ delegates }: { delegates: Delegate[] }): React.ReactElement {
  // const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.TOP_DELEGATES);

  return (
    <Flex
      sx={{
        flexDirection: 'column',
        width: '100vw',
        ml: 'calc(600px - 100vw / 2)'
      }}
    >
      <Flex
        sx={{
          justifyContent: 'space-between',
          px: 'calc( calc( 100vw - 1200px) / 2)'
        }}
      >
        <Flex sx={{ flexDirection: 'column', flex: 1, gap: 2 }}>
          <Heading>Meet the Delegates</Heading>
          <Text sx={{ color: 'textMuted', variant: 'smallText' }}>
            Vote delegation allows for MKR holders to delegate their voting power to delegates, which
            increases the effectiveness and efficiency of the governance process.
          </Text>
        </Flex>
        <Flex sx={{ flex: 1, justifyContent: 'flex-end' }}>
          <InternalLink href="/delegates" title="Meet the Delegates">
            <ViewMore label="View All" />
          </InternalLink>
        </Flex>
      </Flex>
      <Flex
        sx={{
          gap: 5,
          overflowX: 'auto',
          pl: 'calc( calc( 100vw - 1200px) / 2)',
          '::-webkit-scrollbar': {
            display: 'none'
          }
        }}
      >
        {delegates.map(delegate => {
          return (
            <Card
              key={delegate.name}
              sx={{
                width: 8,
                minWidth: 8,
                boxShadow: 'floater',
                border: 'none',
                my: 4,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 2
              }}
            >
              <DelegateAvatarName delegate={delegate} />
              <Flex sx={{ flexDirection: 'column' }}>
                <Text variant="secondary">Values</Text>
                <Text>Values not implemented error o_0</Text>
              </Flex>
              <ParticipationBreakdown delegate={delegate} />
              <Flex sx={{ justifyContent: 'space-between' }}>
                <InternalLink href={`/address/${delegate.voteDelegateAddress}`} title="View poll details">
                  <Button
                    variant="outline"
                    sx={{
                      borderRadius: 'round',
                      ':hover': {
                        color: 'text',
                        borderColor: 'onSecondary',
                        backgroundColor: 'background'
                      }
                    }}
                  >
                    View Profile Details
                  </Button>
                </InternalLink>
                <InternalLink href={`/address/${delegate.voteDelegateAddress}`} title="View poll details">
                  <Button
                    variant="outline"
                    sx={{
                      borderRadius: 'round',
                      ':hover': {
                        color: 'text',
                        borderColor: 'onSecondary',
                        backgroundColor: 'background'
                      }
                    }}
                  >
                    <Flex sx={{ alignItems: 'center' }}>
                      <Icon sx={{ mr: 2 }} name="play" size={3} />
                      <Text>Meet the Delegate</Text>
                    </Flex>
                  </Button>
                </InternalLink>
              </Flex>
            </Card>
          );
        })}
      </Flex>
    </Flex>
  );
}
