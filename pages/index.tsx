/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useEffect, useState, useCallback } from 'react';
import { GetStaticProps } from 'next';
import { Heading, Text, Flex, useColorMode, Box, Alert } from 'theme-ui';
import ErrorPage from 'modules/app/components/ErrorPage';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import Stack from 'modules/app/components/layout/layouts/Stack';
import { ViewMore } from 'modules/home/components/ViewMore';
import { PollCategoriesLanding } from 'modules/home/components/PollCategoriesLanding';
import { GovernanceStats } from 'modules/home/components/GovernanceStats';
import ExecutiveOverviewCard from 'modules/executive/components/ExecutiveOverviewCard';
import { PlayButton } from 'modules/home/components/PlayButton';
import PageLoadingPlaceholder from 'modules/app/components/PageLoadingPlaceholder';
import VideoModal from 'modules/app/components/VideoModal';
import { isDefaultNetwork } from 'modules/web3/helpers/networks';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import { ErrorBoundary } from 'modules/app/components/ErrorBoundary';
import Skeleton from 'react-loading-skeleton';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import useSWR, { useSWRConfig } from 'swr';
import TopDelegates from 'modules/delegates/components/TopDelegates';
import { ResourcesLanding } from 'modules/home/components/ResourcesLanding/ResourcesLanding';
import { PollsOverviewLanding } from 'modules/home/components/PollsOverviewLanding';
import BigNumber from 'lib/bigNumberJs';
import { InternalLink } from 'modules/app/components/InternalLink';
import InformationParticipateMakerGovernance from 'modules/home/components/InformationParticipateMakerGovernance/InformationParticipateMakerGovernance';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { useAccount } from 'modules/app/hooks/useAccount';
import { VIDEO_URLS } from 'modules/app/client/videos.constants';
import Participation from 'modules/home/components/Participation';
import TabsNavigation from 'modules/home/components/TabsNavigation';
import { StickyContainer, Sticky } from 'react-sticky';
import { useInView } from 'react-intersection-observer';
import { useVotedProposals } from 'modules/executive/hooks/useVotedProposals';
import { fetchLandingPageData } from 'modules/home/api/fetchLandingPageData';
import { LandingPageData } from 'modules/home/api/fetchLandingPageData';
import { useLandingPageDelegates } from 'modules/gql/hooks/useLandingPageDelegates';
import { fetchDelegationMetrics } from 'modules/delegates/api/fetchDelegationMetrics';

const LandingPage = ({
  proposals,
  polls,
  pollStats,
  pollTags,
  delegates,
  delegatesInfo,
  stats,
  mkrOnHat,
  hat,
  mkrInChief
}: LandingPageData) => {
  const bpi = useBreakpointIndex();
  const [videoOpen, setVideoOpen] = useState(false);
  const [mode] = useColorMode();
  const [backgroundImage, setBackroundImage] = useState('url(/assets/bg_medium.jpeg)');

  // change background on color mode switch
  useEffect(() => {
    setBackroundImage(mode === 'dark' ? 'url(/assets/bg_dark_medium.jpeg)' : 'url(/assets/bg_medium.jpeg)');
  }, [mode]);

  // account
  const { account, votingAccount } = useAccount();

  const activeDelegates = delegatesInfo
    .sort((a, b) => {
      const [first] = a.combinedParticipation?.toString().split('%') || '0';
      const [second] = b.combinedParticipation?.toString().split('%') || '0';
      return parseFloat(second) - parseFloat(first);
    })
    .slice(0, 5);

  // executives
  const { data: votedProposals, mutate: mutateVotedProposals } = useVotedProposals();

  // revalidate votedProposals if connected address changes
  useEffect(() => {
    mutateVotedProposals();
  }, [votingAccount]);

  // Use intersection observers to change the hash on scroll
  const [activeTab, setActiveTab] = useState('#vote');

  const { ref: voteRef, inView: voteInview } = useInView({
    /* Optional options */
    threshold: 0.5
  });

  const { ref: learnRef, inView: learnInview } = useInView({
    /* Optional options */
    threshold: 0.5
  });

  const { ref: engageRef, inView: engageInview } = useInView({
    /* Optional options */
    threshold: 0.5
  });

  const { ref: delegateRef, inView: delegateInview } = useInView({
    /* Optional options */
    threshold: 0.5
  });

  useEffect(() => {
    if (learnInview) {
      setActiveTab('#learn');
    } else if (voteInview) {
      setActiveTab('#vote');
    } else if (engageInview) {
      setActiveTab('#engage');
    } else if (delegateInview) {
      setActiveTab('#delegate');
    }
  }, [learnInview, voteInview, engageInview, delegateInview]);

  const hashChangeHandler = useCallback(() => {
    setActiveTab(window.location.hash);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', hashChangeHandler);
      return () => {
        window.removeEventListener('hashchange', hashChangeHandler);
      };
    }
  }, []);


  useEffect(() => {
    const fetchnMetrics = async () => {
      const metrics = await fetchDelegationMetrics(SupportedNetworks.TENDERLY);
      console.log('metrics', metrics);
    };
  
    fetchnMetrics();
  }, []);

  return (
    <div>
      {delegates.length === 0 && delegatesInfo.length === 0 && polls.length === 0 && (
        <Alert variant="warning">
          <Text>There is a problem loading the governance data. Please, try again later.</Text>
        </Alert>
      )}
      <Box
        as={'div'}
        sx={{
          top: 0,
          left: 0,
          pt: '100%',
          width: '100%',
          zIndex: -1,
          position: 'absolute',
          backgroundImage,
          backgroundSize: ['cover', 'contain'],
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <VideoModal isOpen={videoOpen} onDismiss={() => setVideoOpen(false)} url={VIDEO_URLS.howToVote} />
      <StickyContainer>
        <PrimaryLayout sx={{ maxWidth: 'page' }}>
          <Stack gap={[5, 6]} separationType="p">
            <section>
              <Flex sx={{ flexDirection: ['column', 'column', 'row'], justifyContent: 'space-between' }}>
                <Flex sx={{ p: 3, width: ['100%', '100%', '50%'], flexDirection: 'column' }}>
                  <Heading as="h1" sx={{ color: 'text', fontSize: [7, 8] }}>
                    Maker Governance
                  </Heading>
                  <Heading as="h1" sx={{ color: 'text', fontSize: [7, 8] }}>
                    Voting Portal
                  </Heading>
                  <Text as="p" sx={{ fontWeight: 'semiBold', my: 3, width: ['100%', '100%', '80%'] }}>
                    Vote with or delegate your MKR tokens to help protect the integrity of the Maker protocol
                  </Text>
                  <Box>
                    <PlayButton
                      label="How to vote"
                      onClick={() => setVideoOpen(true)}
                      styles={{ mr: [1, 3] }}
                    />
                  </Box>
                </Flex>
                <Flex sx={{ py: 3, px: [1, 3], width: ['100%', '100%', '50%'], flexDirection: 'column' }}>
                  <Flex sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Heading>Latest Executive</Heading>
                    <InternalLink href={'/executive'} title="Latest Executive">
                      <ViewMore />
                    </InternalLink>
                  </Flex>
                  <Flex sx={{ mt: 3 }}>
                    <ErrorBoundary componentName="Latest Executive">
                      {proposals ? (
                        proposals.length > 0 ? (
                          <ExecutiveOverviewCard
                            votedProposals={votedProposals}
                            account={account}
                            isHat={hat ? hat.toLowerCase() === proposals[0].address.toLowerCase() : false}
                            proposal={proposals[0]}
                          />
                        ) : (
                          <Text>No proposals found</Text>
                        )
                      ) : (
                        <Skeleton />
                      )}
                    </ErrorBoundary>
                  </Flex>
                </Flex>
              </Flex>
            </section>

            <section>
              <ErrorBoundary componentName="Governance Stats">
                <GovernanceStats
                  pollStats={pollStats}
                  stats={stats}
                  mkrOnHat={mkrOnHat}
                  mkrInChief={mkrInChief}
                />
              </ErrorBoundary>
            </section>

            <section id="vote">
              <Sticky topOffset={bpi < 1 ? 1050 : 700}>
                {({ style, isSticky }) => (
                  <Box
                    style={{
                      ...style,
                      zIndex: 100,
                      width: isSticky ? '100%' : 'auto',
                      left: 0,
                      top: 66
                    }}
                  >
                    <TabsNavigation activeTab={activeTab} />
                  </Box>
                )}
              </Sticky>
              <Box ref={voteRef} />
              <Box sx={{ mt: 3 }}>
                <PollsOverviewLanding polls={polls} activePollCount={pollStats.active} allTags={pollTags} />
              </Box>
              <PollCategoriesLanding pollCategories={pollTags} />
            </section>

            <section id="delegate">
              <Box ref={delegateRef} />
              <TopDelegates
                topDelegates={delegates}
                totalMKRDelegated={new BigNumber(stats?.totalMKRDelegated || 0)}
              />
            </section>

            <Box as={'section'} sx={{ position: 'relative', overflowY: 'clip' }} id="learn">
              <Box
                sx={{
                  background: 'onSurfaceAlt',
                  width: '200vw',
                  zIndex: -1,
                  ml: '-100vw',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '1720px'
                }}
              />
              <Box ref={learnRef} />
              <InformationParticipateMakerGovernance />
              <ResourcesLanding />
            </Box>

            <section id="engage">
              <Box ref={engageRef} />
              <Participation activeDelegates={activeDelegates} bpi={bpi} />
            </section>
            <Flex
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              sx={{ justifyContent: 'flex-end', mb: 3 }}
            >
              <ViewMore label="Back to the top" icon="chevron_up" />
            </Flex>
          </Stack>
        </PrimaryLayout>
      </StickyContainer>
    </div>
  );
};

export default function Index({
  proposals: prefetchedProposals,
  polls: prefetchedPolls,
  pollStats: prefetchedPollStats,
  pollTags: prefetchedPollTags,
  mkrOnHat: prefetchedMkrOnHat,
  hat: prefetchedHat,
  mkrInChief: prefetchedMkrInChief
}: LandingPageData): JSX.Element {
  const { network } = useWeb3();
  const [delegatesData, delegatesInfo] = useLandingPageDelegates();
  const fallbackData = isDefaultNetwork(network)
    ? {
        proposals: prefetchedProposals,
        polls: prefetchedPolls,
        pollStats: prefetchedPollStats,
        pollTags: prefetchedPollTags,
        mkrOnHat: prefetchedMkrOnHat,
        hat: prefetchedHat,
        mkrInChief: prefetchedMkrInChief
      }
    : null;

  const { cache } = useSWRConfig();
  const cacheKey = `page/landing/${network}`;
  const { data, error } = useSWR<Partial<LandingPageData>>(
    !network || isDefaultNetwork(network) ? null : cacheKey,
    () => fetchLandingPageData(network, true),
    {
      revalidateOnMount: !cache.get(cacheKey),
      ...(fallbackData && { fallbackData })
    }
  );

  if (!isDefaultNetwork(network) && !data && !error) {
    return <PageLoadingPlaceholder sidebar={false} />;
  }

  if (error) {
    return (
      <PrimaryLayout sx={{ maxWidth: 'dashboard' }}>
        <ErrorPage statusCode={500} title="Error fetching data" />
      </PrimaryLayout>
    );
  }

  const props = {
    proposals: isDefaultNetwork(network) ? prefetchedProposals : data?.proposals ?? [],
    polls: isDefaultNetwork(network) ? prefetchedPolls : data?.polls || [],
    pollStats: isDefaultNetwork(network)
      ? prefetchedPollStats
      : data?.pollStats || { active: 0, finished: 0, total: 0 },
    pollTags: isDefaultNetwork(network) ? prefetchedPollTags : data?.pollTags || [],
    delegates: delegatesData.data?.delegates ?? [],
    delegatesInfo: delegatesInfo.data ?? [],
    stats: delegatesData.data?.stats,
    mkrOnHat: isDefaultNetwork(network) ? prefetchedMkrOnHat : data?.mkrOnHat ?? undefined,
    hat: isDefaultNetwork(network) ? prefetchedHat : data?.hat ?? undefined,
    mkrInChief: isDefaultNetwork(network) ? prefetchedMkrInChief : data?.mkrInChief ?? undefined
  };

  return <LandingPage {...props} />;
}

export const getStaticProps: GetStaticProps = async () => {
  const { proposals, polls, pollStats, pollTags, mkrOnHat, hat, mkrInChief } = await fetchLandingPageData(
    SupportedNetworks.MAINNET
  );

  return {
    revalidate: 5 * 60, // allow revalidation every 30 minutes
    props: {
      proposals,
      polls,
      pollStats,
      pollTags,
      mkrOnHat,
      hat,
      mkrInChief
    }
  };
};
