import { useEffect, useState } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
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
  Badge
} from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { Icon } from '@makerdao/dai-ui-icons';

// lib
import { fetchJson } from 'lib/fetchJson';
import { isActivePoll } from 'modules/polling/helpers/utils';
import { formatDateWithTime } from 'lib/datetime';
import { isDefaultNetwork } from 'modules/web3/helpers/networks';

// api
import { Poll } from 'modules/polling/types';

// components
import Skeleton from 'modules/app/components/SkeletonThemed';
import CountdownTimer from 'modules/app/components/CountdownTimer';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import SidebarLayout from 'modules/app/components/layout/layouts/Sidebar';
import Stack from 'modules/app/components/layout/layouts/Stack';
import Tabs from 'modules/app/components/Tabs';
import VoteBreakdown from 'modules/polling/components/VoteBreakdown';
import VoteBox from 'modules/polling/components/VoteBox';
import SystemStatsSidebar from 'modules/app/components/SystemStatsSidebar';
import ResourceBox from 'modules/app/components/ResourceBox';
import MobileVoteSheet from 'modules/polling/components/MobileVoteSheet';
import VotesByAddress from 'modules/polling/components/VotesByAddress';
import { PollCategoryTag } from 'modules/polling/components/PollCategoryTag';
import { HeadComponent } from 'modules/app/components/layout/Head';
import BigNumber from 'bignumber.js';
import PollWinningOptionBox from 'modules/polling/components/PollWinningOptionBox';
import { usePollTally } from 'modules/polling/hooks/usePollTally';
import { usePollComments } from 'modules/comments/hooks/usePollComments';
import PollComments from 'modules/comments/components/PollComments';
import { useAccount } from 'modules/app/hooks/useAccount';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { fetchPollBySlug } from 'modules/polling/api/fetchPollBy';
import { DEFAULT_NETWORK } from 'modules/web3/constants/networks';
import { ErrorBoundary } from 'modules/app/components/ErrorBoundary';
import { getPolls } from 'modules/polling/api/fetchPolls';

const editMarkdown = content => {
  // hide the duplicate proposal title
  return content.replace(/^<h1>.*<\/h1>|^<h2>.*<\/h2>/, '');
};

const PollView = ({ poll }: { poll: Poll }) => {
  const { account } = useAccount();
  const bpi = useBreakpointIndex({ defaultIndex: 2 });
  const [shownOptions, setShownOptions] = useState(6);

  const VotingWeightComponent = dynamic(() => import('../../modules/polling/components/VoteWeightVisual'), {
    ssr: false
  });

  const [mobileVotingPoll, setMobileVotingPoll] = useState<Poll>(poll);

  const { tally } = usePollTally(poll.pollId, 60000);
  const { comments, error: errorComments } = usePollComments(poll.pollId);

  return (
    <PrimaryLayout shortenFooter={true} sx={{ maxWidth: 'dashboard' }}>
      {bpi === 0 && account && isActivePoll(poll) && (
        <MobileVoteSheet setPoll={setMobileVotingPoll} poll={mobileVotingPoll} withStart />
      )}
      <SidebarLayout>
        <HeadComponent title={poll.title} description={`${poll.title}. End Date: ${poll.endDate}.`} />

        <div>
          <Flex mb={2} sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
            <Link href={{ pathname: '/polling' }}>
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
                  href={{ pathname: '/polling/[poll-hash]' }}
                  as={{ pathname: `/polling/${poll.ctx.prev.slug}` }}
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
                  href={{ pathname: '/polling/[poll-hash]' }}
                  as={{ pathname: `/polling/${poll.ctx.next.slug}` }}
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
            <Flex sx={{ flexDirection: 'column', px: [3, 4], pt: [3, 4] }}>
              <Box>
                <Flex sx={{ justifyContent: 'space-between', flexDirection: ['column', 'row'] }}>
                  <Text
                    variant="caps"
                    sx={{
                      fontSize: [1],
                      color: 'textSecondary'
                    }}
                  >
                    Posted {formatDateWithTime(poll.startDate)} | Poll ID {poll.pollId}
                  </Text>

                  <CountdownTimer
                    key={poll.multiHash}
                    endText="Poll ended"
                    endDate={poll.endDate}
                    sx={{ ml: [0, 'auto'] }}
                  />
                </Flex>
                <Flex
                  sx={{
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    mb: 2,
                    flexDirection: ['column', 'row']
                  }}
                >
                  <Box>
                    <Heading mt="2" mb="2" sx={{ fontSize: [5, 6] }}>
                      {poll.title}
                    </Heading>

                    <Flex sx={{ mt: 3, mb: 3 }}>
                      {poll.categories.map(c => (
                        <Box key={c} sx={{ marginRight: 2 }}>
                          <PollCategoryTag category={c} />
                        </Box>
                      ))}
                    </Flex>

                    <Flex sx={{ justifyContent: 'space-between', mb: 2, flexDirection: ['column', 'row'] }}>
                      {poll.discussionLink && (
                        <Box>
                          <ExternalLink title="Discussion" href={poll.discussionLink} target="_blank">
                            <Text sx={{ fontSize: 3, fontWeight: 'semiBold' }}>
                              Discussion
                              <Icon ml={2} name="arrowTopRight" size={2} />
                            </Text>
                          </ExternalLink>
                        </Box>
                      )}
                    </Flex>
                  </Box>
                </Flex>
              </Box>
            </Flex>

            <Tabs
              tabListStyles={{ pl: [3, 4] }}
              tabTitles={[
                'Poll Detail',
                'Vote Breakdown',
                `Comments${comments ? ` (${comments.length})` : ''}`
              ]}
              tabRoutes={['Poll Detail', 'Vote Breakdown', 'Comments']}
              tabPanels={[
                <div key={1}>
                  <div
                    data-testid="poll-detail"
                    sx={{ variant: 'markdown.default', p: [3, 4] }}
                    dangerouslySetInnerHTML={{ __html: editMarkdown(poll.content) }}
                  />
                </div>,
                !tally ? (
                  <Box sx={{ m: 4 }} key={2}>
                    <Skeleton />
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
                    <Flex
                      data-testid="voting-stats"
                      sx={{ p: [3, 4], flexDirection: 'column' }}
                      key={'voting stats'}
                    >
                      <Text variant="microHeading" sx={{ mb: 3 }}>
                        Voting Stats
                      </Text>
                      <Flex sx={{ justifyContent: 'space-between', mb: 3, fontSize: [2, 3] }}>
                        <Text sx={{ color: 'textSecondary' }}>Total Votes</Text>
                        {tally ? (
                          <Text>{new BigNumber(tally.totalMkrParticipation).toFormat(3)} MKR</Text>
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
                    <Flex
                      data-testid="voting-by-address"
                      sx={{ p: [3, 4], flexDirection: 'column' }}
                      key={'votes by address'}
                    >
                      <Text variant="microHeading" sx={{ mb: 3 }}>
                        Voting By Address
                      </Text>
                      {tally && tally.votesByAddress && tally.totalMkrParticipation ? (
                        <VotesByAddress tally={tally} poll={poll} />
                      ) : tally && tally.numVoters === 0 ? (
                        <Text sx={{ color: 'textSecondary' }}>No votes yet</Text>
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
                      {tally && tally.numVoters > 0 && <VotingWeightComponent tally={tally} poll={poll} />}
                      {tally && tally.numVoters === 0 && (
                        <Text sx={{ color: 'textSecondary' }}>No votes yet</Text>
                      )}
                    </Flex>
                  ]
                ),
                <div key={3}>
                  {!errorComments && <PollComments comments={comments} tally={tally} poll={poll} />}
                  {errorComments && (
                    <Badge
                      variant="warning"
                      sx={{
                        color: 'warning',
                        borderColor: 'warning',
                        textTransform: 'uppercase',
                        display: 'inline-flex',
                        alignItems: 'center',
                        m: 3
                      }}
                    >
                      Error loading comments
                    </Badge>
                  )}
                </div>
              ]}
              banner={
                tally && tally.totalMkrParticipation > 0 ? (
                  <Box>
                    <Divider my={0} />
                    <PollWinningOptionBox tally={tally} poll={poll} />
                    <Divider my={0} />
                  </Box>
                ) : null
              }
            />
          </Card>
        </div>
        <Stack gap={3}>
          {!!account && bpi > 0 && (
            <ErrorBoundary componentName="Poll Voting">
              <VoteBox poll={poll} />
            </ErrorBoundary>
          )}
          <ErrorBoundary componentName="System Info">
            <SystemStatsSidebar
              fields={['polling contract', 'savings rate', 'total dai', 'debt ceiling', 'system surplus']}
            />
          </ErrorBoundary>
          <ResourceBox type={'polling'} />
          <ResourceBox type={'general'} />
        </Stack>
      </SidebarLayout>
    </PrimaryLayout>
  );
};

export default function PollPage({ poll: prefetchedPoll }: { poll?: Poll }): JSX.Element {
  const [_poll, _setPoll] = useState<Poll>();
  const [error, setError] = useState<string>();
  const { query, isFallback } = useRouter();
  const { network } = useActiveWeb3React();

  // fetch poll contents at run-time if on any network other than the default
  useEffect(() => {
    if (!network) return;
    if (query['poll-hash'] && !isDefaultNetwork(network)) {
      fetchJson(`/api/polling/${query['poll-hash']}?network=${network}`)
        .then(response => {
          _setPoll(response);
        })
        .catch(setError);
    }
  }, [query['poll-hash'], network]);

  const poll = (isDefaultNetwork(network) ? prefetchedPoll : _poll) as Poll;

  if (!poll && (error || (isDefaultNetwork(network) && !isFallback && !prefetchedPoll?.multiHash))) {
    return (
      <ErrorPage statusCode={404} title="Poll either does not exist, or could not be fetched at this time" />
    );
  }

  if (isFallback || (!isDefaultNetwork(network) && !_poll))
    return (
      <PrimaryLayout shortenFooter={true}>
        <p>Loading…</p>
      </PrimaryLayout>
    );

  return (
    <ErrorBoundary componentName="Poll Page">
      <PollView poll={poll} />
    </ErrorBoundary>
  );
}

// export const getServerSideProps: GetServerSideProps = async (context): Promise<any> => {
//   const slug = context.query['poll-hash'] as string;
//   const network = context.query['network'] as string;
//   const networkToFetch = network && isSupportedNetwork(network) ? network : DEFAULT_NETWORK.network;

//   const poll = await fetchPollBySlug(slug, networkToFetch);

//   return {
//     props: {
//       poll
//     }
//   };
// };

export const getStaticProps: GetStaticProps = async ({ params }) => {
  // fetch poll contents at build-time if on the default network
  const pollSlug = params?.['poll-hash'] as string;
  // invariant(pollSlug, 'getStaticProps poll hash not found in params');

  const poll = await fetchPollBySlug(pollSlug, DEFAULT_NETWORK.network);

  if (!poll) {
    return { revalidate: 30, props: { poll: null } };
  }

  return {
    revalidate: 30, // allow revalidation every 30 seconds
    props: {
      poll
    }
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const pollsResponse = await getPolls();
  const MAX = 10;
  const paths = pollsResponse.polls.slice(0, MAX).map(p => `/polling/${p.slug}`);

  return {
    paths,
    fallback: 'blocking'
  };
};
