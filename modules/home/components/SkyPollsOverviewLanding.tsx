/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Flex, Heading, Grid } from 'theme-ui';
import { InternalLink } from 'modules/app/components/InternalLink';
import { ViewMore } from 'modules/home/components/ViewMore';
import { ErrorBoundary } from 'modules/app/components/ErrorBoundary';
import SkyPollOverviewCard, { SkyPoll } from 'modules/polling/components/SkyPollOverviewCard';
import { TagCount } from 'modules/app/types/tag';

type Props = {
  skyPolls?: SkyPoll[];
  allTags: TagCount[];
};

export const SkyPollsOverviewLanding = ({ skyPolls, allTags }: Props): JSX.Element => {
  if (!skyPolls || skyPolls.length === 0) {
    return <></>;
  }

  // Only show first 2 polls on landing page
  const pollsToDisplay = skyPolls.slice(0, 2);

  return (
    <Flex sx={{ flexDirection: 'column' }}>
      <Flex sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Heading>Recent Sky Polls</Heading>
        <InternalLink href={'/polling'} title="View All Polls">
          <ViewMore label="View All" />
        </InternalLink>
      </Flex>
      <Flex>
        <ErrorBoundary componentName="Sky Polls">
          <Grid gap={4} columns={[1, 1, 1, 2]}>
            {pollsToDisplay.map(poll => (
              <SkyPollOverviewCard
                key={poll.pollId}
                poll={poll}
                allTags={allTags}
              />
            ))}
          </Grid>
        </ErrorBoundary>
      </Flex>
    </Flex>
  );
};