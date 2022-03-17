import { Flex, Heading, Link as ThemeUILink, Grid, Text } from 'theme-ui';
import Link from 'next/link';
import { ViewMore } from 'modules/home/components/ViewMore';
import { ErrorBoundary } from 'modules/app/components/ErrorBoundary';
import PollOverviewCard from 'modules/polling/components/PollOverviewCard';
import { Poll } from 'modules/polling/types';

type Props = {
  activePolls: Poll[];
};

export const ActivePollsLanding = ({ activePolls }: Props): JSX.Element => (
  <Flex sx={{ flexDirection: 'column' }}>
    <Flex sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Heading>Active Polls</Heading>
      <Link href={{ pathname: '/polling' }} passHref>
        <ThemeUILink title="Active Polls">
          <ViewMore label="View All" />
        </ThemeUILink>
      </Link>
    </Flex>
    <Flex>
      <ErrorBoundary componentName="Active Polls">
        <Grid gap={4} columns={[1, 1, 2]}>
          {activePolls.map(poll => (
            <PollOverviewCard key={poll.pollId} poll={poll} reviewPage={false} showVoting={false} />
          ))}
        </Grid>
      </ErrorBoundary>
    </Flex>
  </Flex>
);
