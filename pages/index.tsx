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
import { GovernanceStats } from 'modules/home/components/GovernanceStats';
import SkyExecutiveOverviewCardLanding from 'modules/executive/components/SkyExecutiveOverviewCardLanding';
import { PlayButton } from 'modules/home/components/PlayButton';
import PageLoadingPlaceholder from 'modules/app/components/PageLoadingPlaceholder';
import VideoModal from 'modules/app/components/VideoModal';
import { isDefaultNetwork } from 'modules/web3/helpers/networks';
import { ErrorBoundary } from 'modules/app/components/ErrorBoundary';
import Skeleton from 'react-loading-skeleton';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import useSWR, { useSWRConfig } from 'swr';
import { ResourcesLanding } from 'modules/home/components/ResourcesLanding/ResourcesLanding';
import { SkyPollsOverviewLanding } from 'modules/home/components/SkyPollsOverviewLanding';
import { InternalLink } from 'modules/app/components/InternalLink';
import { useAccount } from 'modules/app/hooks/useAccount';
import { VIDEO_URLS } from 'modules/app/client/videos.constants';
import { fetchLandingPageData } from 'modules/home/api/fetchLandingPageData';
import { LandingPageData } from 'modules/home/api/fetchLandingPageData';
import { useNetwork } from 'modules/app/hooks/useNetwork';
import { useLandingPageDelegates } from 'modules/home/hooks/useLandingPageDelegates';

const LandingPage = ({
  skyExecutive,
  skyHatInfo,
  polls,
  skyPolls,
  pollTags,
  stats,
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
                  <Heading>Latest Sky Executive</Heading>
                  <InternalLink href={'/executive'} title="Latest Executive">
                    <ViewMore />
                  </InternalLink>
                </Flex>
                <Flex sx={{ mt: 3 }}>
                  <ErrorBoundary componentName="Latest Executive">
                    {skyExecutive ? (
                      <SkyExecutiveOverviewCardLanding
                        proposal={{
                          ...skyExecutive,
                          spellData: {
                            ...skyExecutive.spellData,
                            nextCastTime: skyExecutive.spellData.nextCastTime
                              ? new Date(skyExecutive.spellData.nextCastTime)
                              : undefined,
                            datePassed: skyExecutive.spellData.datePassed
                              ? new Date(skyExecutive.spellData.datePassed)
                              : undefined,
                            dateExecuted: skyExecutive.spellData.dateExecuted
                              ? new Date(skyExecutive.spellData.dateExecuted)
                              : undefined,
                            officeHours: skyExecutive.spellData.officeHours === 'true'
                          }
                        }}
                        isHat={skyExecutive.address === skyHatInfo?.hatAddress}
                        skyOnHat={skyHatInfo?.skyOnHat ? BigInt(skyHatInfo.skyOnHat) : undefined}
                      />
                    ) : (
                      <Skeleton height={300} />
                    )}
                  </ErrorBoundary>
                </Flex>
              </Flex>
            </Flex>
          </section>

          <section id="vote">
            <Box sx={{ mt: 3 }}>
              <SkyPollsOverviewLanding skyPolls={skyPolls} allTags={pollTags} />
            </Box>
          </section>

          <section>
            <ErrorBoundary componentName="Governance Stats">
              <GovernanceStats stats={stats} mkrInChief={mkrInChief} />
            </ErrorBoundary>
          </section>

          <Box as={'section'} sx={{ position: 'relative', overflowY: 'clip' }} id="learn">
            <Box
              sx={{
                background: 'onSurfaceAlt',
                width: '200vw',
                zIndex: -1,
                ml: '-100vw',
                position: 'absolute',
                top: 80,
                left: 0,
                height: '1720px'
              }}
            />
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
  skyExecutive: prefetchedSkyExecutive,
  skyHatInfo: prefetchedSkyHatInfo,
  polls: prefetchedPolls,
  skyPolls: prefetchedSkyPolls,
  pollStats: prefetchedPollStats,
  pollTags: prefetchedPollTags,
  mkrInChief: prefetchedMkrInChief
}: LandingPageData): JSX.Element {
  const network = useNetwork();
  const [delegatesData] = useLandingPageDelegates();
  const fallbackData = isDefaultNetwork(network)
    ? {
        skyExecutive: prefetchedSkyExecutive,
        skyHatInfo: prefetchedSkyHatInfo,
        polls: prefetchedPolls,
        skyPolls: prefetchedSkyPolls,
        pollStats: prefetchedPollStats,
        pollTags: prefetchedPollTags,
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
    skyExecutive: isDefaultNetwork(network) ? prefetchedSkyExecutive : data?.skyExecutive,
    skyHatInfo: isDefaultNetwork(network) ? prefetchedSkyHatInfo : data?.skyHatInfo,
    polls: isDefaultNetwork(network) ? prefetchedPolls : data?.polls || [],
    skyPolls: isDefaultNetwork(network) ? prefetchedSkyPolls : data?.skyPolls,
    pollStats: isDefaultNetwork(network)
      ? prefetchedPollStats
      : data?.pollStats || { active: 0, finished: 0, total: 0 },
    pollTags: isDefaultNetwork(network) ? prefetchedPollTags : data?.pollTags || [],
    stats: delegatesData.data?.stats,
    mkrInChief: isDefaultNetwork(network) ? prefetchedMkrInChief : data?.mkrInChief ?? undefined
  };

  return <LandingPage {...props} />;
}

export const getStaticProps: GetStaticProps = async () => {
  const { skyExecutive, skyHatInfo, polls, skyPolls, pollStats, pollTags, mkrInChief } =
    await fetchLandingPageData(SupportedNetworks.MAINNET);

  return {
    revalidate: 5 * 60, // allow revalidation every 5 minutes
    props: {
      skyExecutive: skyExecutive || null,
      skyHatInfo: skyHatInfo || null,
      polls,
      skyPolls: skyPolls || null,
      pollStats,
      pollTags,
      mkrInChief
    }
  };
};
