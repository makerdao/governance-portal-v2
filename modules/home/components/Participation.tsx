import { Text, Image, Flex, Heading, Container, Link as ExternalLink, Card } from 'theme-ui';
import { InternalLink } from 'modules/app/components/InternalLink';
import Stack from 'modules/app/components/layout/layouts/Stack';
import { ViewMore } from './ViewMore';
import useSWR from 'swr';
import { fetchJson } from 'lib/fetchJson';
import { format, sub } from 'date-fns';
import ParticipationChart from './ParticipationChart';
import forumPosts from '../forumPosts.json';

const ForumPosts = ({ posts }) => {
  return (
    <Flex sx={{ flexDirection: 'column' }}>
      <Flex sx={{ justifyContent: 'space-between' }}>
        <Heading>Relevant Forum Posts</Heading>
        <InternalLink href="/delegates" title="View Forum Posts">
          <ViewMore label="View Forum" />
        </InternalLink>
      </Flex>
      <Flex sx={{ gap: 3, justifyContent: 'space-between' }}>
        {posts.map(({ title, image, summary, username, link }) => {
          return (
            <Card
              key={title}
              variant="compact"
              sx={{
                flex: 1
              }}
            >
              <Flex sx={{ display: 'flex', gap: 3 }}>
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

export default function Participation(): React.ReactElement {
  const MONTHS_PAST = 6;
  // This makes sure the timestamp is the same throughout the day so the SWR cache-key doesn't change
  const unixtimeStart =
    new Date(format(sub(new Date(), { months: MONTHS_PAST }), 'MM-dd-yyyy')).getTime() / 1000;

  const { data: locks } = useSWR(`/api/executive/all-locks?unixtimeStart=${unixtimeStart}`, fetchJson);

  return (
    <Flex sx={{ flexDirection: 'column', gap: 4 }}>
      <Container sx={{ textAlign: 'center', maxWidth: 'title', mb: 4 }}>
        <Stack gap={2}>
          <Heading as="h2">Follow the Conversation and Participate</Heading>
          <Text as="p" sx={{ color: 'textSecondary', px: 'inherit', fontSize: [2, 4] }}>
            Engage with the Maker Community and make informed decisions.
          </Text>
        </Stack>
      </Container>
      {/* container for forum posts */}
      <ForumPosts posts={forumPosts} />
      {/* container for gov participation and top voter */}
      <Flex sx={{ justifyContent: 'space-between', gap: 3, flexWrap: 'wrap' }}>
        {/* governance participation */}
        <Flex sx={{ flexDirection: 'column', flex: 2 }}>
          <Flex sx={{ justifyContent: 'space-between' }}>
            <Heading>Governance Participation</Heading>
          </Flex>
          {locks && (
            <Flex
              sx={{
                border: 'light',
                borderRadius: 'medium',
                borderColor: 'secondaryMuted',
                p: 3
              }}
            >
              <ParticipationChart data={locks} monthsPast={MONTHS_PAST} />
            </Flex>
          )}
        </Flex>

        {/* top voters */}
        <Flex sx={{ flexDirection: 'column', flex: 1 }}>
          <Flex sx={{ justifyContent: 'space-between' }}>
            <Heading>Top Voters</Heading>
            <InternalLink href="/delegates" title="View All Delegates">
              <ViewMore label="View All" />
            </InternalLink>
          </Flex>
          <Flex
            sx={{
              border: 'light',
              borderRadius: 'medium',
              borderColor: 'secondaryMuted'
            }}
          >
            stuff
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
