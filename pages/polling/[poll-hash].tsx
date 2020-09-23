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
import VotingStatus from '../../components/polling/PollVotingStatus';
import VoteBox from '../../components/polling/[poll-hash]/VoteBox';
import SystemStatsSidebar from '../../components/SystemStatsSidebar';
import ResourceBox from '../../components/ResourceBox';
import Poll from '../../types/poll';
import PollTally from '../../types/pollTally';
import useAccountsStore from '../../stores/accounts';
import MobileVoteSheet from '../../components/polling/MobileVoteSheet';
import { useBreakpointIndex } from '@theme-ui/match-media';
import useBallotStore from '../../stores/ballot';

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

const editMarkdown = content => {
  // hide the duplicate proposal title
  return content.replace(/^<h1>.*<\/h1>/, '');
};

const PollView = ({ poll, polls: prefetchedPolls }: { poll: Poll; polls: Poll[] }) => {
  const network = getNetwork();
  const account = useAccountsStore(state => state.currentAccount);
  const bpi = useBreakpointIndex({ defaultIndex: 2 });
  const ballot = useBallotStore(state => state.ballot);
  const ballotLength = Object.keys(ballot).length;
  const [_polls, _setPolls] = useState<Poll[]>();
  const [shownOptions, setShownOptions] = useState(6);

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
    <PrimaryLayout shortenFooter={true} sx={{ maxWidth: '1380px' }}>
      {bpi === 0 && account && isActivePoll(poll) && (
        <MobileVoteSheet
          account={account}
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
                <Button variant="mutedOutline">
                  <Flex sx={{ display: ['none', 'block'], alignItems: 'center', whiteSpace: 'nowrap' }}>
                    <Icon name="chevron_left" size="2" mr={2} />
                    Back to all polls
                  </Flex>
                  <Flex sx={{ display: ['block', 'none'], alignItems: 'center', whiteSpace: 'nowrap' }}>
                    Back to all
                  </Flex>
                </Button>
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
                    <Button variant="mutedOutline">
                      <Flex sx={{ alignItems: 'center', whiteSpace: 'nowrap' }}>
                        <Icon name="chevron_left" size={2} mr={2} /> Previous Poll
                      </Flex>
                    </Button>
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
                    <Button variant="mutedOutline">
                      <Flex sx={{ alignItems: 'center', whiteSpace: 'nowrap' }}>
                        Next Poll <Icon name="chevron_right" size={2} ml={2} />
                      </Flex>
                    </Button>
                  </NavLink>
                </Link>
              )}
            </Flex>
          </Flex>
          <Card sx={{ p: [0, 0] }}>
            {bpi < 1 ? (
              <Flex sx={{ flexDirection: 'column', p: [3, 4] }}>
                <Box>
                  <Text
                    variant="caps"
                    sx={{
                      fontSize: [1],
                      color: 'textSecondary'
                    }}
                  >
                    {new Date(poll.startDate).toLocaleString('default', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Text>
                  <Heading mt="2" mb="3" sx={{ fontSize: [5, 6] }}>
                    {poll.title}
                  </Heading>
                </Box>
                <Flex sx={{ justifyContent: 'space-between' }}>
                  <CountdownTimer key={poll.multiHash} endText="Poll ended" endDate={poll.endDate} />
                  <VotingStatus sx={{ display: ['none', 'block'] }} poll={poll} />
                </Flex>
              </Flex>
            ) : (
              <Flex sx={{ flexDirection: 'column', px: [3, 4], pt: 4, pb: 3 }}>
                <Box>
                  <Flex sx={{ justifyContent: 'space-between' }}>
                    <Text
                      variant="caps"
                      sx={{
                        fontSize: [1],
                        color: 'textSecondary'
                      }}
                    >
                      {new Date(poll.startDate).toLocaleString('default', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </Text>
                    <CountdownTimer key={poll.multiHash} endText="Poll ended" endDate={poll.endDate} />
                  </Flex>
                  <Heading mt="2" mb="3" sx={{ fontSize: [5, 6] }}>
                    {poll.title}
                  </Heading>
                </Box>
                <Flex sx={{ justifyContent: 'space-between' }}>
                  <VotingStatus sx={{ display: ['none', 'block'] }} poll={poll} />
                </Flex>
              </Flex>
            )}

            <Tabs
              tabListStyles={{ pl: [3, 4] }}
              tabTitles={['Poll Detail', 'Vote Breakdown']}
              tabPanels={[
                <div
                  key={1}
                  sx={{ variant: 'markdown.default', p: [3, 4] }}
                  dangerouslySetInnerHTML={{ __html: editMarkdown(poll.content) }}
                />,
                [
                  poll.voteType === 'Plurality Voting' ? (
                    <div key={2} sx={{ p: [3, 4] }}>
                      <Text variant="microHeading" sx={{ mb: 3 }}>
                        Vote Breakdown
                      </Text>
                      {Object.keys(poll.options)
                        .slice(0, shownOptions)
                        .map((_, i) => (
                          <div key={i}>
                            <Flex sx={{ justifyContent: 'space-between' }}>
                              <Text sx={{ color: 'textSecondary', width: '20%' }}>
                                {tally ? (
                                  tally.results[i].optionName
                                ) : (
                                  <Delay>
                                    <Skeleton />
                                  </Delay>
                                )}
                              </Text>
                              <Text sx={{ color: 'textSecondary', width: tally ? 'unset' : '30%' }}>
                                {tally ? (
                                  `${tally.results[i].firstChoice
                                    .add(tally.results[i].transfer)
                                    .toBigNumber()
                                    .toFormat(2)} MKR Voting (${tally.results[i].firstPct.toFixed(2)}%)`
                                ) : (
                                  <Delay>
                                    <Skeleton />
                                  </Delay>
                                )}
                              </Text>
                            </Flex>

                            {tally ? (
                              <Tooltip
                                label={`First choice ${tally.results[i].firstChoice
                                  .toBigNumber()
                                  .toFormat(2)}`}
                              >
                                <Box my={2}>
                                  <Progress
                                    sx={{ backgroundColor: 'muted', mb: '3' }}
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
                  ) : (
                    <div key={2} sx={{ p: [3, 4] }}>
                      <Text variant="microHeading" sx={{ mb: 3 }}>
                        Vote Breakdown
                      </Text>
                      {Object.keys(poll.options)
                        .slice(0, shownOptions)
                        .map((_, i) => (
                          <div key={i}>
                            <Flex sx={{ justifyContent: 'space-between' }}>
                              <Text sx={{ color: 'textSecondary', width: '20%' }}>
                                {tally ? (
                                  tally.results[i].optionName
                                ) : (
                                  <Delay>
                                    <Skeleton />
                                  </Delay>
                                )}
                              </Text>
                              <Text sx={{ color: 'textSecondary', width: tally ? 'unset' : '30%' }}>
                                {tally ? (
                                  (console.log(tally.results[i].firstPct),
                                  `${tally.results[i].firstChoice
                                    .add(tally.results[i].transfer)
                                    .toBigNumber()
                                    .toFormat(2)} MKR Voting (${tally.results[i].firstPct
                                    .plus(tally.results[i].transferPct)
                                    .toFixed(2)}%)`)
                                ) : (
                                  <Delay>
                                    <Skeleton />
                                  </Delay>
                                )}
                              </Text>
                            </Flex>

                            {tally ? (
                              <Box sx={{ position: 'relative', mb: 4 }}>
                                <Tooltip
                                  label={`First choice ${tally.results[i].firstChoice
                                    .toBigNumber()
                                    .toFormat(2)}`}
                                >
                                  <Box my={2}>
                                    <Progress
                                      sx={{ backgroundColor: 'muted', zIndex: 2, position: 'absolute' }}
                                      max={tally.totalMkrParticipation.toBigNumber()}
                                      value={tally.results[i].firstChoice.toBigNumber()}
                                    />
                                  </Box>
                                </Tooltip>
                                <Tooltip
                                  label={`Transfer ${tally.results[i].transfer.toBigNumber().toFormat(2)}`}
                                >
                                  <Box my={2}>
                                    <Progress
                                      sx={{ backgroundColor: 'muted', zIndex: 1, position: 'absolute' }}
                                      max={tally.totalMkrParticipation.toBigNumber()}
                                      value={tally.results[i].firstChoice
                                        .add(tally.results[i].transfer)
                                        .toBigNumber()}
                                    />
                                  </Box>
                                </Tooltip>
                              </Box>
                            ) : (
                              <Delay>
                                <Skeleton />
                              </Delay>
                            )}
                          </div>
                        ))}
                    </div>
                  ),
                  shownOptions < Object.keys(poll.options).length && (
                    <Box sx={{ px: 4, pb: 3 }} key={'view more'}>
                      <Button
                        variant="mutedOutline"
                        onClick={() => {
                          setShownOptions(shownOptions + 6);
                        }}
                      >
                        <Flex sx={{ alignItems: 'center' }}>
                          View more
                          <Icon name="chevron_down" size="2" ml={2} />
                        </Flex>
                      </Button>
                    </Box>
                  ),

                  <Divider key={'divider'} />,
                  <Flex sx={{ p: 4, flexDirection: 'column' }} key={'voting stats'}>
                    <Text variant="microHeading" sx={{ mb: 4 }}>
                      Voting Stats
                    </Text>
                    <Flex sx={{ justifyContent: 'space-between', mb: 3 }}>
                      <Text sx={{ color: 'onSurface' }}>Total Votes</Text>
                      {tally ? (
                        <Text>{tally.totalMkrParticipation.toBigNumber().toFormat(2)} MKR</Text>
                      ) : (
                        <Box sx={{ width: 3 }}>
                          <Skeleton />
                        </Box>
                      )}
                    </Flex>

                    <Flex sx={{ justifyContent: 'space-between' }}>
                      <Text sx={{ color: 'onSurface' }}>Unique Voters</Text>
                      {tally ? (
                        <Text>{tally.numVoters}</Text>
                      ) : (
                        <Box sx={{ width: 3 }}>
                          <Skeleton />
                        </Box>
                      )}
                    </Flex>
                  </Flex>
                ]
              ]}
            />
          </Card>
        </div>
        <StickyColumn sx={{ pt: 3 }}>
          <Stack gap={3}>
            {!!account && <VoteBox poll={poll} />}
            <SystemStatsSidebar
              fields={['mkr needed to pass', 'savings rate', 'total dai', 'debt ceiling', 'system surplus']}
            />
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
