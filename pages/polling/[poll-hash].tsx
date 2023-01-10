/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useEffect, useState } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import ErrorPage from 'modules/app/components/ErrorPage';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Card, Flex, Divider, Heading, Text, Box, Button, Badge, Label, Checkbox } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { Icon } from '@makerdao/dai-ui-icons';
import { fetchJson } from 'lib/fetchJson';
import { isActivePoll } from 'modules/polling/helpers/utils';
import { formatDateWithTime } from 'lib/datetime';
import { isDefaultNetwork } from 'modules/web3/helpers/networks';
import { Poll } from 'modules/polling/types';
import Skeleton from 'modules/app/components/SkeletonThemed';
import CountdownTimer from 'modules/app/components/CountdownTimer';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import SidebarLayout from 'modules/app/components/layout/layouts/Sidebar';
import Stack from 'modules/app/components/layout/layouts/Stack';
import Tabs from 'modules/app/components/Tabs';
import VoteBreakdown from 'modules/polling/components/VoteBreakdown';
import VoteBox from 'modules/polling/components/poll-vote-input/VoteBox';
import SystemStatsSidebar from 'modules/app/components/SystemStatsSidebar';
import ResourceBox from 'modules/app/components/ResourceBox';
import MobileVoteSheet from 'modules/polling/components/MobileVoteSheet';
import VotesByAddress from 'modules/polling/components/VotesByAddress';
import { PollCategoryTag } from 'modules/polling/components/PollCategoryTag';
import { HeadComponent } from 'modules/app/components/layout/Head';
import BigNumber from 'lib/bigNumberJs';
import PollWinningOptionBox from 'modules/polling/components/PollWinningOptionBox';
import { usePollTally } from 'modules/polling/hooks/usePollTally';
import { usePollComments } from 'modules/comments/hooks/usePollComments';
import PollComments from 'modules/comments/components/PollComments';
import { useAccount } from 'modules/app/hooks/useAccount';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import { fetchPollById, fetchPollBySlug } from 'modules/polling/api/fetchPollBy';
import { DEFAULT_NETWORK } from 'modules/web3/constants/networks';
import { ErrorBoundary } from 'modules/app/components/ErrorBoundary';
import { getPolls } from 'modules/polling/api/fetchPolls';
import { InternalLink } from 'modules/app/components/InternalLink';
import { ExternalLink } from 'modules/app/components/ExternalLink';
import usePollsStore from 'modules/polling/stores/polls';
import { PollVoteTypeIndicator } from 'modules/polling/components/PollOverviewCard/PollVoteTypeIndicator';
import { DialogOverlay, DialogContent } from 'modules/app/components/Dialog';
import BoxWithClose from 'modules/app/components/BoxWithClose';

const editMarkdown = content => {
  // hide the duplicate proposal title
  return content.replace(/^<h1>.*<\/h1>|^<h2>.*<\/h2>/, '');
};

const PollView = ({ poll }: { poll: Poll }) => {
  const filteredPollData = usePollsStore(state => state.filteredPolls);
  const [prevSlug, setPrevSlug] = useState(poll.ctx?.prev?.slug);
  const [nextSlug, setNextSlug] = useState(poll.ctx?.next?.slug);

  const { account } = useAccount();
  const bpi = useBreakpointIndex({ defaultIndex: 2 });
  const [shownOptions, setShownOptions] = useState(6);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [showSmallVoters, setShowSmallVoters] = useState(false);

  const VotingWeightComponent = dynamic(() => import('../../modules/polling/components/VoteWeightVisual'), {
    ssr: false
  });

  const [mobileVotingPoll, setMobileVotingPoll] = useState<Poll>(poll);

  const { tally } = usePollTally(poll.pollId, 60000);
  const { comments, error: errorComments } = usePollComments(poll.pollId);

  useEffect(() => {
    if (filteredPollData && filteredPollData.length > 0) {
      const currentIdx = filteredPollData?.findIndex(({ pollId }) => pollId === poll.pollId);
      const previousPoll = filteredPollData[currentIdx - 1];
      const nextPoll = filteredPollData[currentIdx + 1];
      setPrevSlug(previousPoll?.slug);
      setNextSlug(nextPoll?.slug);
    } else {
      setPrevSlug(poll.ctx?.prev?.slug);
      setNextSlug(poll.ctx?.next?.slug);
    }
  }, [filteredPollData, poll]);

  const handleSmallVotersChecked = () => {
    setShowSmallVoters(!showSmallVoters);
  };

  return (
    <PrimaryLayout sx={{ maxWidth: 'dashboard' }}>
      {bpi === 0 && account && isActivePoll(poll) && (
        <MobileVoteSheet setPoll={setMobileVotingPoll} poll={mobileVotingPoll} withStart />
      )}
      <SidebarLayout>
        <HeadComponent title={poll.title} description={`${poll.title}. End Date: ${poll.endDate}.`} />

        <div>
          <Flex mb={2} sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
            <InternalLink href={'/polling'} title="View polling page">
              <Button variant="mutedOutline">
                <Flex sx={{ display: ['none', 'block'], alignItems: 'center', whiteSpace: 'nowrap' }}>
                  <Icon name="chevron_left" size="2" mr={2} />
                  Back to All Polls
                </Flex>
                <Flex sx={{ display: ['block', 'none'], alignItems: 'center', whiteSpace: 'nowrap' }}>
                  Back to all
                </Flex>
              </Button>
            </InternalLink>
            <Flex sx={{ justifyContent: 'space-between' }}>
              {prevSlug && (
                <InternalLink href={`/polling/${prevSlug}`} title="View previous poll" scroll={false}>
                  <Button variant="mutedOutline">
                    <Flex sx={{ alignItems: 'center', whiteSpace: 'nowrap' }}>
                      <Icon name="chevron_left" size={2} mr={2} />
                      {bpi > 0 ? 'Previous Poll' : 'Previous'}
                    </Flex>
                  </Button>
                </InternalLink>
              )}
              {nextSlug && (
                <InternalLink
                  href={`/polling/${nextSlug}`}
                  title="View next poll"
                  scroll={false}
                  styles={{ ml: 2 }}
                >
                  <Button variant="mutedOutline">
                    <Flex sx={{ alignItems: 'center', whiteSpace: 'nowrap' }}>
                      {bpi > 0 ? 'Next Poll' : 'Next'}
                      <Icon name="chevron_right" size={2} ml={2} />
                    </Flex>
                  </Button>
                </InternalLink>
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

                  <Flex sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <CountdownTimer
                      key={poll.multiHash}
                      endText="Poll ended"
                      endDate={poll.endDate}
                      sx={{ ml: [0, 'auto'] }}
                    />
                    <Box sx={{ ml: 2 }}>
                      <PollVoteTypeIndicator poll={poll} />
                    </Box>
                  </Flex>
                </Flex>

                <Flex sx={{ mb: 2, flexDirection: 'column' }}>
                  <Heading mt="2" sx={{ fontSize: [5, 6] }}>
                    {poll.title}
                  </Heading>

                  <Flex sx={{ my: 2, flexWrap: 'wrap' }}>
                    {poll.tags.map(c => (
                      <Box key={c.id} sx={{ my: 2, mr: 2 }}>
                        <PollCategoryTag tag={c} />
                      </Box>
                    ))}
                    {poll.tags.some(tag => tag.id.includes('impact')) && (
                      <>
                        <Flex onClick={() => setOverlayOpen(true)} sx={{ cursor: 'pointer' }}>
                          <Icon name="info" color="textSecondary" mt={3} />
                        </Flex>
                        {overlayOpen && (
                          <DialogOverlay isOpen={overlayOpen} onDismiss={() => setOverlayOpen(false)}>
                            <DialogContent ariaLabel="Impact tags info">
                              <BoxWithClose close={() => setOverlayOpen(false)}>
                                <Flex
                                  sx={{
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                  }}
                                >
                                  <Text sx={{ textAlign: 'center' }}>
                                    GovAlpha applies impact estimations to active governance items (MIPs and
                                    Signal Requests).
                                    <br />
                                    <br />
                                    To know more about impact tags please visit the{' '}
                                    <ExternalLink
                                      title="Maker Operational Manual"
                                      href="https://manual.makerdao.com/governance/off-chain/impact-estimations"
                                    >
                                      <Text>Maker Operational Manual</Text>
                                    </ExternalLink>
                                    .
                                  </Text>
                                </Flex>
                              </BoxWithClose>
                            </DialogContent>
                          </DialogOverlay>
                        )}
                      </>
                    )}
                  </Flex>

                  <Flex sx={{ justifyContent: 'space-between', mb: 2, flexDirection: ['column', 'row'] }}>
                    {poll.discussionLink && (
                      <Box>
                        <ExternalLink title="Discussion" href={poll.discussionLink}>
                          <Text sx={{ fontSize: 3, fontWeight: 'semiBold' }}>
                            Discussion
                            <Icon ml={2} name="arrowTopRight" size={2} />
                          </Text>
                        </ExternalLink>
                      </Box>
                    )}
                  </Flex>
                </Flex>
              </Box>
            </Flex>

            <Tabs
              tabListStyles={{ pl: [3, 4] }}
              tabTitles={[
                'Vote Breakdown',
                'Poll Detail',
                `Comments${comments ? ` (${comments.length})` : ''}`
              ]}
              tabRoutes={['Vote Breakdown', 'Poll Detail', 'Comments']}
              tabPanels={[
                !tally ? (
                  <Box sx={{ m: 4 }} key={1}>
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
                      <Flex sx={{ justifyContent: 'space-between', mb: 3 }}>
                        <Text sx={{ color: 'textSecondary' }}>Total Voting Power</Text>
                        {tally ? (
                          <Text>{new BigNumber(tally.totalMkrParticipation).toFormat(3)} MKR</Text>
                        ) : (
                          <Box sx={{ width: 4 }}>
                            <Skeleton />
                          </Box>
                        )}
                      </Flex>

                      <Flex sx={{ justifyContent: 'space-between' }}>
                        <Text sx={{ color: 'textSecondary' }}>Total Votes</Text>
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
                      <Flex sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Text variant="microHeading">Voting By Address</Text>
                        <Box>
                          <Label
                            variant="thinLabel"
                            sx={{
                              fontSize: 1,
                              alignItems: 'center',
                              color: 'textSecondary',
                              py: 0,
                              cursor: 'pointer'
                            }}
                          >
                            <Checkbox checked={showSmallVoters} onChange={handleSmallVotersChecked} />
                            <Text variant="caps">Show &lt;0.05 MKR voters</Text>
                          </Label>
                        </Box>
                      </Flex>
                      {tally && tally.votesByAddress && tally.numVoters > 0 ? (
                        <VotesByAddress
                          tally={{
                            ...tally,
                            votesByAddress: tally.votesByAddress.filter(
                              vote => showSmallVoters || +vote.mkrSupport >= 0.05
                            )
                          }}
                          poll={poll}
                        />
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
                <div key={2}>
                  <div
                    data-testid="poll-detail"
                    sx={{ variant: 'markdown.default', p: [3, 4] }}
                    dangerouslySetInnerHTML={{ __html: editMarkdown(poll.content) }}
                  />
                </div>,
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
                tally && tally.totalMkrParticipation > 0 && tally.winningOptionName ? (
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
              fields={[
                'polling contract v2',
                'polling contract v1',
                'arbitrum polling contract',
                'savings rate',
                'total dai',
                'debt ceiling',
                'system surplus'
              ]}
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
  const { network } = useWeb3();

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
      <PrimaryLayout sx={{ maxWidth: 'dashboard' }}>
        <ErrorPage
          statusCode={404}
          title="Poll either does not exist, or could not be fetched at this time"
        />
      </PrimaryLayout>
    );
  }

  if (isFallback || (!isDefaultNetwork(network) && !_poll))
    return (
      <PrimaryLayout sx={{ maxWidth: 'dashboard' }}>
        <p>Loading…</p>
      </PrimaryLayout>
    );

  return (
    <ErrorBoundary componentName="Poll Page">
      <PollView poll={poll} />
    </ErrorBoundary>
  );
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  // fetch poll contents at build-time if on the default network
  const pollSlug = params?.['poll-hash'] as string;
  // invariant(pollSlug, 'getStaticProps poll hash not found in params');

  let poll = await fetchPollBySlug(pollSlug, DEFAULT_NETWORK.network);

  if (!poll && !isNaN(parseInt(pollSlug))) {
    poll = await fetchPollById(parseInt(pollSlug), DEFAULT_NETWORK.network);
  }

  if (!poll) {
    return { revalidate: 30, props: { poll: null } };
  }

  return {
    revalidate: 30, // allow revalidation every 30 seconds
    props: {
      key: poll.pollId, // makes sure state updates when navigating to a new dynamic route
      poll
    }
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const pollsResponse = await getPolls();
  const MAX = 5;
  const paths = pollsResponse.polls.slice(0, MAX).map(p => `/polling/${p.slug}`);

  return {
    paths,
    fallback: true
  };
};
