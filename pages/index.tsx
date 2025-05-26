/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useEffect, useState } from 'react';
import { GetStaticProps } from 'next';
import { Heading, Text, Flex, Box, Alert } from 'theme-ui';
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
import { ErrorBoundary } from 'modules/app/components/ErrorBoundary';
import SkeletonThemed from 'modules/app/components/SkeletonThemed';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import useSWR, { useSWRConfig } from 'swr';
import TopDelegates from 'modules/delegates/components/TopDelegates';
import { ResourcesLanding } from 'modules/home/components/ResourcesLanding/ResourcesLanding';
import { PollsOverviewLanding } from 'modules/home/components/PollsOverviewLanding';
import { InternalLink } from 'modules/app/components/InternalLink';
import InformationParticipateSkyGovernance from 'modules/home/components/InformationParticipateSkyGovernance/InformationParticipateSkyGovernance';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { useAccount } from 'modules/app/hooks/useAccount';
import { VIDEO_URLS } from 'modules/app/client/videos.constants';
import Participation from 'modules/home/components/Participation';
import { useVotedProposals } from 'modules/executive/hooks/useVotedProposals';
import { fetchLandingPageData } from 'modules/home/api/fetchLandingPageData';
import { LandingPageData } from 'modules/home/api/fetchLandingPageData';
import { useLandingPageDelegates } from 'modules/gql/hooks/useLandingPageDelegates';
import { useNetwork } from 'modules/app/hooks/useNetwork';
import { parseEther } from 'viem';

const LandingPage = ({
  proposals,
  polls,
  pollStats,
  pollTags,
  delegates,
  delegatesInfo,
  delegatesError,
  stats,
  skyOnHat,
  hat,
  skyInChief
}: LandingPageData) => {
  const bpi = useBreakpointIndex();
  const [videoOpen, setVideoOpen] = useState(false);

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

  return (
    <div>
      {delegatesError && (
        <Alert variant="warning">
          <Text>There is a problem loading the governance data. Please, try again later.</Text>
        </Alert>
      )}
      <VideoModal isOpen={videoOpen} onDismiss={() => setVideoOpen(false)} url={VIDEO_URLS.howToVote} />
      <PrimaryLayout sx={{ maxWidth: 'page' }}>
        <Stack gap={[5, 6]} separationType="p">
          <section>
            <Flex sx={{ flexDirection: ['column', 'column', 'row'], justifyContent: 'space-between' }}>
              <Flex sx={{ p: 3, width: ['100%', '100%', '50%'], flexDirection: 'column' }}>
                <Heading as="h1" sx={{ color: 'text', fontSize: [7, 8] }}>
                  Sky Governance
                </Heading>
                <Heading as="h1" sx={{ color: 'text', fontSize: [7, 8] }}>
                  Voting Portal
                </Heading>
                <Text as="p" sx={{ fontWeight: 'semiBold', my: 3, width: ['100%', '100%', '80%'] }}>
                  Vote with or delegate your SKY tokens to help protect the integrity of the Sky protocol
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
                      <SkeletonThemed count={1} width="100%" />
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
                skyOnHat={skyOnHat}
                skyInChief={skyInChief}
              />
            </ErrorBoundary>
          </section>

          <section id="vote">
            <Box sx={{ mt: 3 }}>
              <PollsOverviewLanding polls={polls} activePollCount={pollStats.active} allTags={pollTags} />
            </Box>
            <PollCategoriesLanding pollCategories={pollTags} />
          </section>

          <section id="delegate">
            <TopDelegates
              topDelegates={delegates}
              totalSkyDelegated={parseEther((stats?.totalSkyDelegated || 0).toString())}
            />
          </section>

          <Box as={'section'} sx={{ position: 'relative', mt: '4', overflowY: 'clip' }} id="learn">
            <Box
              sx={{
                background: 'surface',
                backdropFilter: 'blur(50px)',
                width: '200vw',
                zIndex: -1,
                ml: '-100vw',
                position: 'absolute',
                top: 0,
                left: 0,
                height: '1720px'
              }}
            />
            <InformationParticipateSkyGovernance />
            <ResourcesLanding />
          </Box>

          <section id="engage">
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
    </div>
  );
};

export default function Index({
  proposals: prefetchedProposals,
  polls: prefetchedPolls,
  pollStats: prefetchedPollStats,
  pollTags: prefetchedPollTags,
  skyOnHat: prefetchedSkyOnHat,
  hat: prefetchedHat,
  skyInChief: prefetchedSkyInChief
}: LandingPageData): JSX.Element {
  const network = useNetwork();
  const [delegatesData, delegatesInfo] = useLandingPageDelegates();
  const fallbackData = isDefaultNetwork(network)
    ? {
        proposals: prefetchedProposals,
        polls: prefetchedPolls,
        pollStats: prefetchedPollStats,
        pollTags: prefetchedPollTags,
        skyOnHat: prefetchedSkyOnHat,
        hat: prefetchedHat,
        skyInChief: prefetchedSkyInChief
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
    delegates: delegatesData.data?.delegates?.slice(0, 5) ?? [],
    delegatesInfo: delegatesInfo.data ?? [],
    delegatesError: delegatesData.error || delegatesInfo.error,
    stats: delegatesData.data?.stats,
    skyOnHat: isDefaultNetwork(network) ? prefetchedSkyOnHat : data?.skyOnHat ?? undefined,
    hat: isDefaultNetwork(network) ? prefetchedHat : data?.hat ?? undefined,
    skyInChief: isDefaultNetwork(network) ? prefetchedSkyInChief : data?.skyInChief ?? undefined
  };

  return <LandingPage {...props} />;
}

export const getStaticProps: GetStaticProps = async () => {
  const { proposals, polls, pollStats, pollTags, skyOnHat, hat, skyInChief } = await fetchLandingPageData(
    SupportedNetworks.MAINNET
  );

  return {
    revalidate: 5 * 60, // allow revalidation every 30 minutes
    props: {
      proposals,
      polls,
      pollStats,
      pollTags,
      skyOnHat,
      hat,
      skyInChief
    }
  };
};
