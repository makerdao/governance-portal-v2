import { Text, Image, Flex, Heading, Container, Link as ExternalLink, Card } from 'theme-ui';
import { InternalLink } from 'modules/app/components/InternalLink';
import Stack from 'modules/app/components/layout/layouts/Stack';
import { ViewMore } from './ViewMore';
import useSWR from 'swr';
import { fetchJson } from 'lib/fetchJson';
import { format, sub } from 'date-fns';
import ParticipationChart from './ParticipationChart';
import forumPosts from '../forumPosts.json';
import { Delegate } from 'modules/delegates/types';
import { DelegatePicture } from 'modules/delegates/components';

const ForumPosts = ({ posts, bpi }: { posts: any[]; bpi: number }) => {
  return (
    <Flex sx={{ flexDirection: 'column', gap: 3 }}>
      <Flex sx={{ justifyContent: 'space-between' }}>
        <Heading>Relevant Forum Posts</Heading>
        <InternalLink href="/delegates" title="View Forum Posts">
          <ViewMore label="View Forum" />
        </InternalLink>
      </Flex>
      <Flex sx={{ gap: 3, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        {posts.map(({ title, image, summary, username, link }) => {
          return (
            <Card
              key={title}
              variant="compact"
              sx={{
                flex: [undefined, undefined, undefined, 1]
              }}
            >
              <Flex
                sx={{
                  display: 'flex',
                  gap: 3,
                  flexDirection: bpi > 1 ? 'row' : 'column'
                }}
              >
                <Image src={image} sx={{ minWidth: '282px', width: '282px', height: '207px' }} />
                <Flex
                  sx={{
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <Flex sx={{ flexDirection: 'column', gap: 2 }}>
                    <Heading variant="microHeading">{title}</Heading>
                    <Text variant="smallText" sx={{ color: 'textSecondary' }}>
                      {summary}
                    </Text>
                    <Text variant="smallText" sx={{ fontStyle: 'italic' }}>
                      by {username}
                    </Text>
                  </Flex>
                  <ExternalLink href={link} title="View Forum Post" target="_blank">
                    <ViewMore label="Read More" />
                  </ExternalLink>
                </Flex>
              </Flex>
            </Card>
          );
        })}
      </Flex>
    </Flex>
  );
};

export default function Participation({
  activeDelegates,
  bpi
}: {
  activeDelegates: Delegate[];
  bpi: number;
}): React.ReactElement {
  const MONTHS_PAST = 6;
  // This makes sure the timestamp is the same throughout the day so the SWR cache-key doesn't change
  const unixtimeStart =
    new Date(format(sub(new Date(), { months: MONTHS_PAST }), 'MM-dd-yyyy')).getTime() / 1000;

  const { data: locks } = useSWR(`/api/executive/all-locks?unixtimeStart=${unixtimeStart}`, fetchJson);

  return (
    <Flex sx={{ flexDirection: 'column', gap: 4 }}>
      <Container sx={{ textAlign: 'center', maxWidth: 'title' }}>
        <Stack gap={2}>
          <Heading as="h2">Follow the Conversation and Participate</Heading>
          <Text as="p" sx={{ color: 'textSecondary', px: 'inherit', fontSize: [2, 4] }}>
            Engage with the Maker Community and make informed decisions.
          </Text>
        </Stack>
      </Container>

      <ForumPosts posts={forumPosts} bpi={bpi} />

      <Flex
        sx={{
          pt: 4,
          justifyContent: 'space-between',
          gap: [5, 3],
          flexDirection: bpi > 1 ? 'row' : 'column'
        }}
      >
        <Flex sx={{ flexDirection: 'column', flex: 2, gap: 3 }}>
          <Flex sx={{ justifyContent: 'space-between' }}>
            <Heading>Governance Participation</Heading>
          </Flex>
          {locks && (
            <Flex
              sx={{
                border: 'light',
                borderRadius: 'medium',
                borderColor: 'secondaryMuted',
                height: '100%',
                pr: [0, 3],
                pb: 3
              }}
            >
              <ParticipationChart data={locks} monthsPast={MONTHS_PAST} />
            </Flex>
          )}
        </Flex>

        <Flex sx={{ flexDirection: 'column', flex: 1, gap: 3 }}>
          <Flex sx={{ justifyContent: 'space-between' }}>
            <Heading>Top Voters</Heading>
            <ExternalLink
              href="https://governance-metrics-dashboard-gupjnd1ew-hernandoagf.vercel.app/"
              title="View More Metrics"
              target="_blank"
            >
              <ViewMore label="View More Metrics" />
            </ExternalLink>
          </Flex>
          <Flex
            sx={{
              border: 'light',
              borderRadius: 'medium',
              borderColor: 'secondaryMuted',
              flexDirection: 'column',
              gap: 3,
              p: 3,
              height: '100%'
            }}
          >
            <Flex sx={{ justifyContent: 'space-between' }}>
              <Text variant="caps" sx={{ color: 'mutedAlt' }}>
                Address
              </Text>
              <Text variant="caps" sx={{ color: 'mutedAlt' }}>
                Participation
              </Text>
            </Flex>
            {activeDelegates.map((delegate, i) => (
              <Flex
                key={delegate.voteDelegateAddress}
                sx={{ justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Flex sx={{ alignItems: 'center', gap: 2 }}>
                  <Text>{i + 1}</Text>
                  <InternalLink href={`/address/${delegate.voteDelegateAddress}`} title="Profile details">
                    <Flex sx={{ alignItems: 'center', gap: 2 }}>
                      <DelegatePicture delegate={delegate} />
                      <Text sx={{ color: 'primary' }}>{delegate.name}</Text>
                    </Flex>
                  </InternalLink>
                </Flex>
                <Text>{delegate.combinedParticipation}</Text>
              </Flex>
            ))}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
