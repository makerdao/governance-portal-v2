/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Text, Image, Flex, Heading, Container, Link as ExternalLink, Card } from 'theme-ui';
import Stack from 'modules/app/components/layout/layouts/Stack';
import { ViewMore } from './ViewMore';
import forumPosts from '../data/forumPosts.json';
import { DelegateInfo, DelegatePaginated } from 'modules/delegates/types';
import { ForumPost } from '../types/participation';

const ForumPosts = ({ posts, bpi }: { posts: ForumPost[]; bpi: number }) => {
  return (
    <Flex sx={{ flexDirection: 'column', gap: 3 }}>
      <Flex sx={{ justifyContent: 'space-between' }}>
        <Heading>Browse the Governance Forum</Heading>
        <ExternalLink href="https://forum.sky.money/" title="View Forum Posts" target="_blank">
          <ViewMore label="View Forum" />
        </ExternalLink>
      </Flex>
      <Flex sx={{ gap: 3, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        {posts.map(({ title, image, summary, link }) => {
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
                  gap: 3,
                  flexDirection: bpi > 0 ? 'row' : 'column'
                }}
              >
                <Image
                  src={image}
                  sx={bpi > 0 ? { ...{ minWidth: '282px', width: '282px', height: '207px' } } : undefined}
                />
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
  bpi
}: {
  activeDelegates: DelegateInfo[] | DelegatePaginated[];
  bpi: number;
}): React.ReactElement {

  return (
    <Flex sx={{ flexDirection: 'column', gap: 4, mb: 4 }}>
      <Container sx={{ textAlign: 'center', maxWidth: 'title' }}>
        <Stack gap={2}>
          <Heading as="h2">Follow the Conversation and Participate</Heading>
          <Text as="p" sx={{ px: 'inherit', fontSize: [2, 4] }}>
            Engage with the Maker Community and make informed decisions.
          </Text>
        </Stack>
      </Container>

      <ForumPosts posts={forumPosts} bpi={bpi} />
    </Flex>
  );
}
