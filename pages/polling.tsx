import { useEffect, useState, useMemo } from 'react';
import { Card, Heading, Checkbox, Label, Box, Flex, Input } from 'theme-ui';
import { useRouter } from 'next/router';
import ErrorPage from 'next/error';

import { isDefaultNetwork } from '../lib/maker';
import { getPolls } from '../lib/api';
import { isActivePoll } from '../lib/utils';
import PrimaryLayout from '../components/layouts/Primary';
import SidebarLayout from '../components/layouts/Sidebar';
import StackLayout from '../components/layouts/Stack';
import PollOverviewCard from '../components/polling/PollOverviewCard';
import Poll from '../types/poll';

type Props = {
  polls: Poll[];
};

const PollingOverview = ({ polls }: Props) => {
  const { asPath } = useRouter();
  const [dateFilter, setDateFilter] = useState<(Date | null)[]>([null, null]);
  const [filterInactivePolls, setFilterInactivePolls] = useState(false);

  useEffect(() => {
    if (asPath.includes('pollFilter=active')) {
      setFilterInactivePolls(true);
    }
  }, [asPath]);

  const filteredPolls = useMemo(
    () =>
      polls.filter(poll => {
        if (new Date(poll.startDate).getTime() > Date.now()) return false; // filter polls that haven't started yet
        if (filterInactivePolls && !isActivePoll(poll)) return false;
        const [startDate, endDate] = dateFilter;
        if (startDate && new Date(poll.startDate).getTime() < startDate.getTime()) return false;
        if (endDate && new Date(poll.startDate).getTime() > endDate.getTime()) return false;
        return true;
      }),
    [polls, filterInactivePolls, dateFilter]
  );

  const activePolls = filteredPolls.filter(poll => isActivePoll(poll));
  const historicalPolls = filteredPolls.filter(poll => !isActivePoll(poll));

  return (
    <PrimaryLayout shortenFooter={true}>
      <Heading as="h1">Polling Votes</Heading>
      <Flex sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
        <Box>
          <Label>
            <Checkbox checked={filterInactivePolls} onChange={() => setFilterInactivePolls(b => !b)} />
            Show only active polls
          </Label>
        </Box>

        <Flex sx={{ flexWrap: 'wrap' }}>
          <Label sx={{ whiteSpace: 'nowrap', alignItems: 'center' }}>
            Show only polls starting after
            <Input
              mx="3"
              type="date"
              onChange={e => setDateFilter([new Date(e.target.value), dateFilter[1]])}
            />
          </Label>
          <Label sx={{ whiteSpace: 'nowrap', alignItems: 'center' }}>
            Show only polls starting before
            <Input
              ml="3"
              type="date"
              onChange={e => setDateFilter([dateFilter[0], new Date(e.target.value)])}
            />
          </Label>
        </Flex>
      </Flex>
      <SidebarLayout>
        <div>
          {activePolls.length > 0 ? (
            <Heading mb={3} as="h3">
              Active Polls
            </Heading>
          ) : null}
          <StackLayout>
            {activePolls.map(poll => (
              <PollOverviewCard key={poll.multiHash} poll={poll} />
            ))}
          </StackLayout>
          {historicalPolls.length > 0 ? (
            <Heading mb={3} mt={4} as="h3">
              Historical Polls
            </Heading>
          ) : null}
          <StackLayout>
            {historicalPolls.map(poll => (
              <PollOverviewCard key={poll.multiHash} poll={poll} />
            ))}
          </StackLayout>
        </div>
        <Flex sx={{ flexDirection: 'column' }}>
          <StackLayout>
            <Card variant="compact">Card 1</Card>
            <Card variant="compact">Card 2</Card>
          </StackLayout>
        </Flex>
      </SidebarLayout>
    </PrimaryLayout>
  );
};

export default function PollingOverviewPage({ polls: prefetchedPolls }: Props) {
  const [_polls, _setPolls] = useState<Poll[]>();
  const [error, setError] = useState<string>();

  // fetch polls at run-time if on any network other than the default
  useEffect(() => {
    if (!isDefaultNetwork()) {
      getPolls()
        .then(_setPolls)
        .catch(setError);
    }
  }, []);

  if (error) {
    return <ErrorPage statusCode={404} title="Error fetching proposals" />;
  }

  if (!isDefaultNetwork() && !_polls)
    return (
      <PrimaryLayout>
        <p>Loading…</p>
      </PrimaryLayout>
    );

  return <PollingOverview polls={isDefaultNetwork() ? prefetchedPolls : (_polls as Poll[])} />;
}

export async function getStaticProps() {
  // fetch polls at build-time if on the default network
  const polls = await getPolls();

  return {
    unstable_revalidate: 30, // allow revalidation every 30 seconds
    props: {
      polls
    }
  };
}
