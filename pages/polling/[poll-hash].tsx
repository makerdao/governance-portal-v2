/** @jsx jsx */
import { useEffect, useState } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import Link from 'next/link';
import ErrorPage from 'next/error';
import { useRouter } from 'next/router';
import useSWR, { mutate } from 'swr';
import invariant from 'tiny-invariant';
import { Card, Flex, Divider, Heading, Text, Progress, NavLink, Box, Button, jsx } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import Tooltip from '@reach/tooltip';
import Skeleton from 'react-loading-skeleton';

import CountdownTimer from '../../components/CountdownTimer';
import Delay from '../../components/Delay';
import { getNetwork, isDefaultNetwork } from '../../lib/maker';
import { getPolls, getPoll } from '../../lib/api';
import { parsePollTally, fetchJson, isActivePoll } from '../../lib/utils';
import PrimaryLayout from '../../components/layouts/Primary';
import SidebarLayout, { StickyColumn } from '../../components/layouts/Sidebar';
import Stack from '../../components/layouts/Stack';
import Tabs from '../../components/Tabs';
import VotingStatus from '../../components/polling/VotingStatus';
import VoteBox from '../../components/polling/[poll-hash]/VoteBox';
import SystemStats from '../../components/polling/[poll-hash]/SystemStatsVertical';
import ResourceBox from '../../components/polling/ResourceBox';
import Poll from '../../types/poll';
import PollTally from '../../types/pollTally';
import useAccountsStore from '../../stores/accounts';
import MobileVoteSheet from '../../components/polling/MobileVoteSheet';
import { useBreakpointIndex } from '@theme-ui/match-media';
import useBallotStore from '../../stores/ballot';

const NavButton = ({ children, ...props }) => (
  <Button
    variant="outline"
    sx={{
      color: 'mutedAlt',
      borderColor: 'secondaryMuted',
      borderRadius: '4px',
      textTransform: 'uppercase',
      fontSize: 1,
      px: [2, 3]
    }}
    {...props}
  >
    {children}
  </Button>
);

// if the poll has ended, always fetch its tally from the server's cache
const getURL = poll =>
  new Date(poll.endDate).getTime() < new Date().getTime()
    ? `/api/polling/tally/cache-no-revalidate/${poll.pollId}?network=${getNetwork()}`
    : `/api/polling/tally/${poll.pollId}?network=${getNetwork()}`;

function prefetchTally(poll) {
  if (typeof window !== 'undefined' && poll) {
    const tallyPromise = fetchJson(getURL(poll)).then(rawTally => parsePollTally(rawTally, poll));
    mutate(getURL(poll), tallyPromise, false);
  }
}

const PollView = ({ poll, polls: prefetchedPolls }: { poll: Poll; polls: Poll[] }) => {
  const network = getNetwork();
  const account = useAccountsStore(state => state.currentAccount);
  const bpi = useBreakpointIndex();
  const ballot = useBallotStore(state => state.ballot);
  const ballotLength = Object.keys(ballot).length;
  const [_polls, _setPolls] = useState<Poll[]>();

  const { data: tally } = useSWR<PollTally>(getURL(poll), async url =>
    parsePollTally(await fetchJson(url), poll)
  );

  useEffect(() => {
    if (!isDefaultNetwork()) {
      getPolls().then(_setPolls);
    } else {
      _setPolls(prefetchedPolls);
    }
  }, []);

  const activePolls = _polls ? _polls.filter(isActivePoll) : [];

  const [mobileVotingPoll, setMobileVotingPoll] = useState<Poll>(poll);
  // prepopulate the local tally cache for polls before and/or after this one
  [poll.ctx.prev, poll.ctx.next].forEach(prefetchTally);
  return (
    <PrimaryLayout shortenFooter={true}>
      {bpi === 0 && account && isActivePoll(poll) && (
        <MobileVoteSheet
          ballotCount={ballotLength}
          activePolls={activePolls}
          setPoll={setMobileVotingPoll}
          poll={mobileVotingPoll}
          withStart
        />
      )}
      <SidebarLayout>
        <div>
          <Flex mb={2} sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
            <Link href={{ pathname: '/polling', query: { network } }}>
              <NavLink p={0}>
                <NavButton>
                  <Flex sx={{ display: ['none', 'block'], alignItems: 'center', whiteSpace: 'nowrap' }}>
                    <Icon name="chevron_left" size="2" mr={2} />
                    Back to all polls
                  </Flex>
                  <Flex sx={{ display: ['block', 'none'], alignItems: 'center', whiteSpace: 'nowrap' }}>
                    Back to all
                  </Flex>
                </NavButton>
              </NavLink>
            </Link>
            <Flex sx={{ justifyContent: 'space-between' }}>
              {poll.ctx?.prev?.slug && (
                <Link
                  scroll={false}
                  href={{ pathname: '/polling/[poll-hash]', query: { network } }}
                  as={{ pathname: `/polling/${poll.ctx.prev.slug}`, query: { network } }}
                >
                  <NavLink p={0}>
                    <NavButton>
                      <Flex sx={{ alignItems: 'center', whiteSpace: 'nowrap' }}>
                        <Icon name="chevron_left" size={2} mr={2} /> Previous Poll
                      </Flex>
                    </NavButton>
                  </NavLink>
                </Link>
              )}
              {poll.ctx?.next?.slug && (
                <Link
                  scroll={false}
                  href={{ pathname: '/polling/[poll-hash]', query: { network } }}
                  as={{ pathname: `/polling/${poll.ctx.next.slug}`, query: { network } }}
                >
                  <NavLink p={0} ml={2}>
                    <NavButton>
                      <Flex sx={{ alignItems: 'center', whiteSpace: 'nowrap' }}>
                        Next Poll <Icon name="chevron_right" size={2} ml={2} />
                      </Flex>
                    </NavButton>
                  </NavLink>
                </Link>
              )}
            </Flex>
          </Flex>
          <Card>
            <Flex sx={{ flexDirection: 'column' }}>
              <Text
                sx={{
                  fontSize: [2, 3],
                  color: 'mutedAlt',
                  textTransform: 'uppercase'
                }}
              >
                {new Date(poll.startDate).toLocaleString('default', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Text>
              <Heading
                my="3"
                sx={{
                  whiteSpace: 'nowrap',
                  overflowX: ['scroll', 'hidden'],
                  overflowY: 'hidden',
                  textOverflow: [null, 'ellipsis'],
                  fontSize: [5, 6]
                }}
              >
                {poll.title}
              </Heading>
              <Flex mb={3} sx={{ justifyContent: 'space-between' }}>
                <CountdownTimer key={poll.multiHash} endText="Poll ended" endDate={poll.endDate} />
                <VotingStatus sx={{ display: ['none', 'block'] }} poll={poll} />
              </Flex>
            </Flex>
            <Divider />
            <Tabs
              tabTitles={['Poll Detail', 'Vote Breakdown']}
              tabPanels={[
                <div key={1} dangerouslySetInnerHTML={{ __html: poll.content }} />,
                <div key={2} sx={{ pt: 3 }}>
                  <Text as="h3" sx={{ pb: 2 }}>
                    Vote Breakdown
                  </Text>
                  {Object.keys(poll.options).map((_, i) => (
                    <div key={i}>
                      <Flex sx={{ justifyContent: 'space-between' }}>
                        <Text sx={{ color: 'textMuted', width: '20%' }}>
                          {tally ? (
                            tally.results[i].optionName
                          ) : (
                            <Delay>
                              <Skeleton />
                            </Delay>
                          )}
                        </Text>
                        <Text sx={{ color: 'textMuted', width: tally ? 'unset' : '30%' }}>
                          {tally ? (
                            `${tally.results[i].firstChoice
                              .add(tally.results[i].transfer)
                              .toBigNumber()
                              .toFormat(2)} MKR Voting`
                          ) : (
                            <Delay>
                              <Skeleton />
                            </Delay>
                          )}
                        </Text>
                      </Flex>

                      {tally ? (
                        <Tooltip
                          sx={{ mt: -1 }}
                          label={`First choice ${tally.results[i].firstChoice.toBigNumber().toFormat(2)}`}
                        >
                          <Box my={1} py={1}>
                            <Progress
                              max={tally.totalMkrParticipation.toBigNumber()}
                              value={tally.results[i].firstChoice.toBigNumber()}
                            />
                          </Box>
                        </Tooltip>
                      ) : (
                        <Delay>
                          <Skeleton />
                        </Delay>
                      )}
                    </div>
                  ))}
                </div>
              ]}
            />
          </Card>
        </div>
        <StickyColumn sx={{ pt: 3 }}>
          <Stack gap={3}>
            {!!account && <VoteBox poll={poll} />}
            <SystemStats />
            <ResourceBox />
          </Stack>
        </StickyColumn>
      </SidebarLayout>
    </PrimaryLayout>
  );
};

export default function PollPage({
  poll: prefetchedPoll,
  polls
}: {
  poll?: Poll;
  polls: Poll[];
}): JSX.Element {
  const [_poll, _setPoll] = useState<Poll>();
  const [error, setError] = useState<string>();
  const { query, isFallback } = useRouter();

  // fetch poll contents at run-time if on any network other than the default
  useEffect(() => {
    if ((!isDefaultNetwork() && query['poll-hash']) || !prefetchedPoll) {
      getPoll(query['poll-hash'] as string)
        .then(_setPoll)
        .catch(setError);
    }
  }, [query['poll-hash']]);

  if (error || (isDefaultNetwork() && !isFallback && !prefetchedPoll?.multiHash)) {
    return (
      <ErrorPage statusCode={404} title="Poll either does not exist, or could not be fetched at this time" />
    );
  }

  if (isFallback || (!isDefaultNetwork() && !_poll))
    return (
      <PrimaryLayout shortenFooter={true}>
        <p>Loading…</p>
      </PrimaryLayout>
    );

  const poll = isDefaultNetwork() ? prefetchedPoll : _poll;
  return <PollView poll={poll as Poll} polls={polls} />;
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  // fetch poll contents at build-time if on the default network
  const pollSlug = params?.['poll-hash'] as string;
  invariant(pollSlug, 'getStaticProps poll hash not found in params');
  const polls = await getPolls();
  const pollExists = !!polls.find(poll => poll.slug === pollSlug);
  if (!pollExists) return { unstable_revalidate: 30, props: { poll: null } };
  const poll = await getPoll(pollSlug);

  return {
    unstable_revalidate: 30, // allow revalidation every 30 seconds
    props: {
      polls,
      poll
    }
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const polls = await getPolls();
  const paths = polls.map(p => `/polling/${p.slug}`);

  return {
    paths,
    fallback: true
  };
};
