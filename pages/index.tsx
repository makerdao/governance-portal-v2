/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useEffect, useState } from 'react';
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
import { ErrorBoundary } from 'modules/app/components/ErrorBoundary';
import Skeleton from 'react-loading-skeleton';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import useSWR, { useSWRConfig } from 'swr';
import { ResourcesLanding } from 'modules/home/components/ResourcesLanding/ResourcesLanding';
import { PollsOverviewLanding } from 'modules/home/components/PollsOverviewLanding';
import { InternalLink } from 'modules/app/components/InternalLink';
import InformationParticipateMakerGovernance from 'modules/home/components/InformationParticipateMakerGovernance/InformationParticipateMakerGovernance';
import { useAccount } from 'modules/app/hooks/useAccount';
import { VIDEO_URLS } from 'modules/app/client/videos.constants';
import { useVotedProposals } from 'modules/executive/hooks/useVotedProposals';
import { fetchLandingPageData } from 'modules/home/api/fetchLandingPageData';
import { LandingPageData } from 'modules/home/api/fetchLandingPageData';
import { useNetwork } from 'modules/app/hooks/useNetwork';

const LandingPage = ({
  proposals,
  polls,
  pollStats,
  pollTags,
  mkrOnHat,
  hat,
  mkrInChief
}: LandingPageData) => {
  const [videoOpen, setVideoOpen] = useState(false);
  const [mode] = useColorMode();
  const [backgroundImage, setBackroundImage] = useState('url(/assets/bg_medium.jpeg)');
  // change background on color mode switch
  useEffect(() => {
    setBackroundImage(mode === 'dark' ? 'url(/assets/bg_dark_medium.jpeg)' : 'url(/assets/bg_medium.jpeg)');
  }, [mode]);

  // account
  const { account, votingAccount } = useAccount();

  // executives
  const { data: votedProposals, mutate: mutateVotedProposals } = useVotedProposals();

  // revalidate votedProposals if connected address changes
  useEffect(() => {
    mutateVotedProposals();
  }, [votingAccount]);

  return (
    <div>
      {polls.length === 0 && (
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
              <GovernanceStats pollStats={pollStats} mkrOnHat={mkrOnHat} mkrInChief={mkrInChief} />
            </ErrorBoundary>
          </section>

          <section id="vote">
            <Box sx={{ mt: 3 }}>
              <PollsOverviewLanding polls={polls} activePollCount={pollStats.active} allTags={pollTags} />
            </Box>
            <PollCategoriesLanding pollCategories={pollTags} />
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
            <InformationParticipateMakerGovernance />
            <ResourcesLanding />
          </Box>

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
  mkrOnHat: prefetchedMkrOnHat,
  hat: prefetchedHat,
  mkrInChief: prefetchedMkrInChief
}: LandingPageData): JSX.Element {
  const network = useNetwork();
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
