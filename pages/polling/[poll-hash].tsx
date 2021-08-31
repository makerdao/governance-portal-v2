/** @jsx jsx */
import { useEffect, useState } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import Link from 'next/link';
import ErrorPage from 'next/error';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import {
  Card,
  Flex,
  Divider,
  Heading,
  Text,
  NavLink,
  Box,
  Button,
  Link as ExternalLink,
  jsx
} from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import invariant from 'tiny-invariant';
import useSWR, { mutate } from 'swr';
import { Icon } from '@makerdao/dai-ui-icons';

// lib
import { getNetwork, isDefaultNetwork } from 'lib/maker';
import { fetchJson, isActivePoll } from 'lib/utils';

// api
import { getPolls, getPoll } from 'modules/polls/api/fetchPolls';
import { Poll, PollTally } from 'modules/polls/types';
import { parseRawPollTally } from 'modules/polls/helpers/parseRawTally';

// stores
import useAccountsStore from 'stores/accounts';
import useBallotStore from 'stores/ballot';

// components
import Skeleton from 'components/SkeletonThemed';
import CountdownTimer from 'components/CountdownTimer';
import PrimaryLayout from 'components/layouts/Primary';
import SidebarLayout from 'components/layouts/Sidebar';
import Stack from 'components/layouts/Stack';
import Tabs from 'components/Tabs';
import VoteBreakdown from 'modules/polls/components/VoteBreakdown';
import VoteBox from 'modules/polls/components/VoteBox';
import SystemStatsSidebar from 'components/SystemStatsSidebar';
import ResourceBox from 'components/ResourceBox';
import PollOptionBadge from 'components/PollOptionBadge';
import MobileVoteSheet from 'components/polling/MobileVoteSheet';
import VotesByAddress from 'modules/polls/components/VotesByAddress';

// if the poll has ended, always fetch its tally from the server's cache
const getURL = poll =>
  new Date(poll.endDate).getTime() < new Date().getTime()
    ? `/api/polling/tally/cache-no-revalidate/${poll.pollId}?network=${getNetwork()}`
    : `/api/polling/tally/${poll.pollId}?network=${getNetwork()}`;

function prefetchTally(poll) {
  if (typeof window !== 'undefined' && poll) {
    const tallyPromise = fetchJson(getURL(poll)).then(rawTally => parseRawPollTally(rawTally, poll));
    mutate(getURL(poll), tallyPromise, false);
  }
}

const editMarkdown = content => {
  // hide the duplicate proposal title
  return content.replace(/^<h1>.*<\/h1>|^<h2>.*<\/h2>/, '');
};

const PollView = ({ poll, polls: prefetchedPolls }: { poll: Poll; polls: Poll[] }) => {
  const network = getNetwork();
  const account = useAccountsStore(state => state.currentAccount);
  const bpi = useBreakpointIndex({ defaultIndex: 2 });
  const ballot = useBallotStore(state => state.ballot);
  const ballotLength = Object.keys(ballot).length;
  const [_polls, _setPolls] = useState<Poll[]>();
  const [shownOptions, setShownOptions] = useState(6);

  const { data: tally, error: tallyError } = useSWR<PollTally>(
    getURL(poll),
    async url => parseRawPollTally(await fetchJson(url), poll),
    { refreshInterval: 30000 }
  );

  const VotingWeightComponent = dynamic(() => import('../../modules/polls/components/VoteWeightCircles'), {
    ssr: false
  });

  useEffect(() => {
    if (!isDefaultNetwork()) {
      getPolls().then(_setPolls);
    } else {
      _setPolls(prefetchedPolls);
    }
  }, []);

  const activePolls = _polls ? _polls.filter(isActivePoll) : [];
  const hasPollEnded = !isActivePoll(poll);

  const [mobileVotingPoll, setMobileVotingPoll] = useState<Poll>(poll);
  // prepopulate the local tally cache for polls before and/or after this one
  [poll.ctx.prev, poll.ctx.next].forEach(prefetchTally);
  return (
    <PrimaryLayout shortenFooter={true} sx={{ maxWidth: 'dashboard' }}>
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
                        <Icon name="chevron_left" size={2} mr={2} />
                        {bpi > 0 ? 'Previous Poll' : 'Previous'}
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
                        {bpi > 0 ? 'Next Poll' : 'Next'}
                        <Icon name="chevron_right" size={2} ml={2} />
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
                  <Flex sx={{ justifyContent: 'space-between' }}>
                    <Text
                      variant="text.caps"
                      sx={{
                        fontSize: 1,
                        color: 'textSecondary'
                      }}
                    >
                      Posted{' '}
                      {new Date(poll.startDate).toLocaleString('default', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        timeZone: 'UTC',
                        timeZoneName: 'short'
                      })}
                    </Text>
                    <CountdownTimer key={poll.multiHash} endText="Poll ended" endDate={poll.endDate} />
                  </Flex>
                  <Heading mt="2" mb="2" sx={{ fontSize: [5, 6] }}>
                    {poll.title}
                  </Heading>
                  {poll.discussionLink && (
                    <Box sx={{ mb: 2 }}>
                      <ExternalLink title="Discussion" href={poll.discussionLink} target="_blank">
                        <Text sx={{ fontSize: 1, fontWeight: 'bold' }}>
                          Discussion
                          <Icon ml={2} name="arrowTopRight" size={2} />
                        </Text>
                      </ExternalLink>
                    </Box>
                  )}
                  <PollOptionBadge poll={poll} sx={{ my: 2, width: '100%', textAlign: 'center' }} />
                </Box>
              </Flex>
            ) : (
              <Flex sx={{ flexDirection: 'column', px: [3, 4], py: 3 }}>
                <Box>
                  <Flex sx={{ justifyContent: 'space-between' }}>
                    <Text
                      variant="caps"
                      sx={{
                        fontSize: [1],
                        color: 'textSecondary'
                      }}
                    >
                      Posted{' '}
                      {new Date(poll.startDate).toLocaleString('default', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        timeZone: 'UTC',
                        timeZoneName: 'short'
                      })}
                    </Text>
                  </Flex>
                  <Flex sx={{ justifyContent: 'space-between' }}>
                    <Flex sx={{ flexDirection: 'column' }}>
                      <Heading mt="2" mb="2" sx={{ fontSize: [5, 6] }}>
                        {poll.title}
                      </Heading>
                      {poll.discussionLink && (
                        <Box>
                          <ExternalLink title="Discussion" href={poll.discussionLink} target="_blank">
                            <Text sx={{ fontSize: 1, fontWeight: 'bold' }}>
                              Discussion
                              <Icon ml={2} name="arrowTopRight" size={2} />
                            </Text>
                          </ExternalLink>
                        </Box>
                      )}
                    </Flex>
                    <Flex sx={{ flexDirection: 'column', minWidth: 7, justifyContent: 'space-between' }}>
                      <CountdownTimer
                        key={poll.multiHash}
                        endText="Poll ended"
                        endDate={poll.endDate}
                        sx={{ ml: 'auto' }}
                      />
                      {hasPollEnded ? <PollOptionBadge poll={poll} sx={{ ml: 'auto' }} /> : null}
                    </Flex>
                  </Flex>
                </Box>
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
                tallyError ? (
                  <Box sx={{ m: 4 }}>
                    <Text as="p">Unable to fetch vote data at this time.</Text>
                  </Box>
                ) : (
                  [
                    <VoteBreakdown
                      poll={poll}
                      shownOptions={shownOptions}
                      tally={tally}
                      key={'vote breakdown'}
                    />,
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
                    <Flex sx={{ p: [3, 4], flexDirection: 'column' }} key={'voting stats'}>
                      <Text variant="microHeading" sx={{ mb: 3 }}>
                        Voting Stats
                      </Text>
                      <Flex sx={{ justifyContent: 'space-between', mb: 3, fontSize: [2, 3] }}>
                        <Text sx={{ color: 'textSecondary' }}>Total Votes</Text>
                        {tally ? (
                          <Text>{tally.totalMkrParticipation.toBigNumber().toFormat(2)} MKR</Text>
                        ) : (
                          <Box sx={{ width: 4 }}>
                            <Skeleton />
                          </Box>
                        )}
                      </Flex>

                      <Flex sx={{ justifyContent: 'space-between', fontSize: [2, 3] }}>
                        <Text sx={{ color: 'textSecondary' }}>Unique Voters</Text>
                        {tally ? (
                          <Text>{tally.numVoters}</Text>
                        ) : (
                          <Box sx={{ width: 4 }}>
                            <Skeleton />
                          </Box>
                        )}
                      </Flex>
                    </Flex>,
                    <Divider key={'divider 2'} />,
                    <Flex sx={{ p: [3, 4], flexDirection: 'column' }} key={'votes by address'}>
                      <Text variant="microHeading" sx={{ mb: 3 }}>
                        Voting By Address
                      </Text>
                      {tally ? (
                        <VotesByAddress
                          votes={tally.votesByAddress}
                          totalMkrParticipation={tally.totalMkrParticipation}
                          poll={poll}
                        />
                      ) : (
                        <Box sx={{ width: '100%' }}>
                          <Box mb={2}>
                            <Skeleton width="100%" />
                          </Box>
                          <Box mb={2}>
                            <Skeleton width="100%" />
                          </Box>
                          <Box mb={2}>
                            <Skeleton width="100%" />
                          </Box>
                        </Box>
                      )}
                    </Flex>,
                    <Divider key={'divider 3'} />,
                    <Flex sx={{ p: [3, 4], flexDirection: 'column' }} key={'vote weight circles'}>
                      <Text variant="microHeading" sx={{ mb: 3 }}>
                        Voting Weight
                      </Text>
                      {tally && <VotingWeightComponent tally={tally} poll={poll} />}
                    </Flex>
                  ]
                )
              ]}
            />
          </Card>
        </div>
        <Stack gap={3}>
          {!!account && bpi > 0 && <VoteBox poll={poll} />}
          <SystemStatsSidebar
            fields={['polling contract', 'savings rate', 'total dai', 'debt ceiling', 'system surplus']}
          />
          <ResourceBox />
        </Stack>
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
    if (query['poll-hash'] && (!isDefaultNetwork() || !prefetchedPoll)) {
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
  if (!pollExists) return { revalidate: 30, props: { poll: null } };
  const poll = await getPoll(pollSlug);

  return {
    revalidate: 30, // allow revalidation every 30 seconds
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
