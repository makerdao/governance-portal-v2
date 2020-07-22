/** @jsx jsx */
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Card, Heading, Box, Flex, jsx, Button, Link, IconButton, Text, Link as ExternalLink } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import ErrorPage from 'next/error';

import { isDefaultNetwork } from '../lib/maker';
import { getPolls } from '../lib/api';
import { isActivePoll } from '../lib/utils';
import PrimaryLayoutNoMargin from '../components/layouts/PrimaryNoMargin';
import SidebarLayout from '../components/layouts/Sidebar';
import Stack from '../components/layouts/Stack';
import PollOverviewCard from '../components/polling/PollOverviewCard';
import Poll from '../types/poll';
import DateFilter from '../components/polling/DateFilter';
import CategoryFilter from '../components/polling/CategoryFilter';

type Props = {
  polls: Poll[];
};

const PollingOverview = ({ polls }: Props) => {
  const [startDate, setStartDate] = useState<Date | ''>('');
  const [endDate, setEndDate] = useState<Date | ''>('');
  const [numHistoricalLoaded, setNumHistoricalLoaded] = useState(10);
  const [showHistoricalPolls, setShowHistoricalPolls] = useState(false);
  const [votingWeightTotal, setVotingWeighTotal] = useState(0)
  const [pollsAdded, setPollsAdded] = useState(0)
  const [pollsAvailable, setPollsAvailable] = useState(0)
  const [categoryFilter, setCategoryFilter] = useState<{ [category: string]: boolean }>(
    polls.map(poll => poll.category).reduce((acc, category) => ({ ...acc, [category]: true }), {})
  );
  const loader = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (location.href.includes('pollFilter=active')) {
      // setFilterInactivePolls(true);
    }
  }, []);

  const filteredPolls = useMemo(() => {
    const start = startDate && new Date(startDate);
    const end = endDate && new Date(endDate);
    return polls.filter(poll => {
      if (start && new Date(poll.startDate).getTime() < start.getTime()) return false;
      if (end && new Date(poll.startDate).getTime() > end.getTime()) return false;
      return categoryFilter[poll.category];
    });
  }, [polls, startDate, endDate, categoryFilter]);

  const activePolls = filteredPolls.filter(poll => isActivePoll(poll));
  const historicalPolls = filteredPolls.filter(poll => !isActivePoll(poll));

  const loadMore = entries => {
    const target = entries.pop();
    if (target.isIntersecting) {
      setNumHistoricalLoaded(
        numHistoricalLoaded < historicalPolls.length ? numHistoricalLoaded + 5 : numHistoricalLoaded
      );
    }
  };

  useEffect(() => {
    let observer;
    if (loader?.current) {
      // Create observer
      observer = new IntersectionObserver(loadMore, {
        root: null,
        rootMargin: '600px'
      });
      // observe the loader
      observer.observe(loader.current);
    }
    return () => {
      if (observer && loader?.current) {
        // clean up
        return observer.unobserve(loader.current as HTMLDivElement);
      }
    };
  }, [loader, loadMore]);

  useEffect(() => {
    setNumHistoricalLoaded(10); // reset inifite scroll if a new filter is applied
  }, [filteredPolls]);

  return (
    <PrimaryLayoutNoMargin shortenFooter={true}>
      <Stack gap={3}>
        <Flex sx={{ alignItems: 'center' }}>
          <Heading as="h1" mr={3}>
            Active Polls
          </Heading>
          <CategoryFilter {...{ categoryFilter, setCategoryFilter }} />
          <DateFilter {...{ startDate, endDate, setStartDate, setEndDate }} sx={{ ml: 3 }} />
        </Flex>
        <SidebarLayout>
          <Box>
            <Stack>
              <div>
                <Stack sx={{ mb: 4 }}>
                  {activePolls.map(poll => (
                    <PollOverviewCard key={poll.multiHash} poll={poll} />
                  ))}
                </Stack>
              </div>
              {showHistoricalPolls ? (
                <div>
                  <Heading mb={3} as="h4">
                    Historical Polls
                    <IconButton onClick={() => setShowHistoricalPolls(false)}>
                      <Icon name="chevron_down" />
                    </IconButton>
                  </Heading>
                  <Stack>
                    {historicalPolls.slice(0, numHistoricalLoaded).map(poll => (
                      <PollOverviewCard key={poll.multiHash} poll={poll} />
                    ))}
                  </Stack>
                  <div ref={loader} />
                </div>
              ) : (
                <Button onClick={() => setShowHistoricalPolls(true)} variant="outline">
                  See all ended polls ({historicalPolls.length})
                </Button>
              )}
            </Stack>
          </Box>
          <Stack>
            <Box>
              <Heading mb={3} as='h4'>
                Your Ballot
              </Heading>
              <Card variant="compact" p={0}>
                <Box p={3} sx={{ borderBottom: '1px solid #D4D9E1'}}>
                  <Text sx={{color: 'onSurface', fontSize: 16, fontWeight: '500'}}>
                    {`${pollsAdded} of ${pollsAvailable} available polls added to ballot`}
                  </Text>
                  <Box sx={{ width: '100%', height: 2, backgroundColor: 'muted', mt: 2}}>
                  </Box>

                </Box>
                <Flex p={3} sx={{ borderBottom: '1px solid #D4D9E1', justifyContent: 'space-between'}}>
                  <Text color="onSurface">
                    Voting weight for all polls
                    <Icon name='question' />
                  </Text>
                  <Text>
                    {`${votingWeightTotal.toFixed(2)} MKR`}
                  </Text>
                </Flex>
                <Flex p={3} sx={{ justifyContent: 'center', alignItems: 'center'}}>
                  <Button disabled={pollsAdded < 1} variant='primary' sx={{width: '100%'}}>Submit Your Ballot</Button>
                </Flex>
              </Card>
            </Box>
            <Box>
              <Heading mb={3} as='h4'>
                Resources
              </Heading>
              <Card variant="compact">
                <ExternalLink href="https://https://forum.makerdao.com/c/governance/" target="_blank">
                  <Flex sx={{ alignItems: 'center'}}>
                    <Text sx={{ color: 'accentBlue', fontSize: 3 }}>
                      Governance Forum
                      <Icon ml={2} name="chevron_right" size={2} sx={{ color: 'mutedAlt' }} />
                    </Text>
                  </Flex>
                </ExternalLink>
                <ExternalLink href="https://community-development.makerdao.com/governance/governance" target="_blank">
                  <Flex sx={{ alignItems: 'center', pt: 3 }}>
                    <Text sx={{ color: 'accentBlue', fontSize: 3 }}>
                      Governance FAQs
                      <Icon ml={2} name="chevron_right" size={2} sx={{ color: 'mutedAlt' }} />
                    </Text>
                  </Flex>
                </ExternalLink>
                <ExternalLink href="https://blog.makerdao.com/makerdao-governance-risk-framework/" target="_blank">
                  <Flex sx={{ alignItems: 'center', pt: 3 }}>
                    <Text sx={{ color: 'accentBlue', fontSize: 3 }}>
                      Governance Risk Framework
                      <Icon ml={2} name="chevron_right" size={2} sx={{ color: 'mutedAlt' }} />
                    </Text>
                  </Flex>
                </ExternalLink>
                <ExternalLink href="https://github.com/makerdao/awesome-makerdao#governance" target="_blank">
                  <Flex sx={{ alignItems: 'center', pt: 3 }}>
                    <Text sx={{ color: 'accentBlue', fontSize: 3 }}>
                      Awesome MakerDAO
                      <Icon ml={2} name="chevron_right" size={2} sx={{ color: 'mutedAlt' }} />
                    </Text>
                  </Flex>
                </ExternalLink>
                <ExternalLink href="https://daistats.com/" target="_blank">
                  <Flex sx={{ alignItems: 'center', pt: 3 }}>
                    <Text sx={{ color: 'accentBlue', fontSize: 3 }}>
                      Governance call schedule
                      <Icon ml={2} name="chevron_right" size={2} sx={{ color: 'mutedAlt' }} />
                    </Text>
                  </Flex>
                </ExternalLink>
                <ExternalLink href="https://calendar.google.com/calendar/embed?src=makerdao.com_3efhm2ghipksegl009ktniomdk%40group.calendar.google.com&ctz=America%2FLos_Angeles" target="_blank">
                  <Flex sx={{ alignItems: 'center', pt: 3 }}>
                    <Text sx={{ color: 'accentBlue', fontSize: 3 }}>
                      MakerDAO events calendar
                      <Icon ml={2} name="chevron_right" size={2} sx={{ color: 'mutedAlt' }} />
                    </Text>
                  </Flex>
                </ExternalLink>
              </Card>
            </Box>
          </Stack>
        </SidebarLayout>
      </Stack>
    </PrimaryLayoutNoMargin>
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
      <PrimaryLayoutNoMargin>
        <p>Loading…</p>
      </PrimaryLayoutNoMargin>
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
