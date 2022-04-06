import { useMemo, useEffect, useState } from 'react';
import { GetStaticProps } from 'next';
import { Heading, Text, Flex, useColorMode, Box } from 'theme-ui';
import ErrorPage from 'next/error';
import { fetchJson } from 'lib/fetchJson';
import { isActivePoll } from 'modules/polling/helpers/utils';
import { useHat } from 'modules/executive/hooks/useHat';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import Stack from 'modules/app/components/layout/layouts/Stack';
import { SystemStats } from 'modules/home/components/SystemStats';
import { ViewMore } from 'modules/home/components/ViewMore';
import { PollCategoriesLanding } from 'modules/home/components/PollCategoriesLanding';
import { GovernanceStats } from 'modules/home/components/GovernanceStats';
import ExecutiveOverviewCard from 'modules/executive/components/ExecutiveOverviewCard';
import { PlayButton } from 'modules/home/components/PlayButton';
import { Proposal } from 'modules/executive/types';
import { Poll } from 'modules/polling/types';
import PageLoadingPlaceholder from 'modules/app/components/PageLoadingPlaceholder';
import { getPolls } from 'modules/polling/api/fetchPolls';
import { getExecutiveProposals } from 'modules/executive/api/fetchExecutives';
import VideoModal from 'modules/app/components/VideoModal';
import { isDefaultNetwork } from 'modules/web3/helpers/networks';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { ErrorBoundary } from 'modules/app/components/ErrorBoundary';
import Skeleton from 'react-loading-skeleton';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { Delegate, DelegatesAPIResponse } from 'modules/delegates/types';
import { fetchDelegates } from 'modules/delegates/api/fetchDelegates';
import useSWR, { useSWRConfig } from 'swr';
import { PollsResponse } from 'modules/polling/types/pollsResponse';
import TopDelegates from 'modules/delegates/components/TopDelegates';
import { ExecutiveProposalsLanding } from 'modules/home/components/ExecutiveProposalsLanding';
import { ActivePollsLanding } from 'modules/home/components/ActivePollsLanding';
import BigNumber from 'bignumber.js';
import { getCategories } from 'modules/polling/helpers/getCategories';
import { InternalLink } from 'modules/app/components/InternalLink';
import MeetDelegates from 'modules/delegates/components/MeetDelegates';

type Props = {
  proposals: Proposal[];
  polls: Poll[];
  network: SupportedNetworks;
  delegates: Delegate[];
  totalMKRDelegated: string;
};

const LandingPage = ({ proposals, polls, network, delegates, totalMKRDelegated }: Props) => {
  const [mode] = useColorMode();
  const activePolls = useMemo(() => polls.filter(poll => isActivePoll(poll)).slice(0, 4), [polls]);
  const [videoOpen, setVideoOpen] = useState(false);
  const topDelegates = delegates.slice(0, 5);

  const [backgroundImage, setBackroundImage] = useState('url(/assets/heroVisual.svg');

  const { data: hat } = useHat();

  const pollCategories = getCategories(polls);

  useEffect(() => {
    setBackroundImage(mode === 'dark' ? 'url(/assets/bg_dark_medium.jpeg)' : 'url(/assets/bg_medium.jpeg)');
  }, [mode]);

  return (
    <div>
      <div
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
      <VideoModal isOpen={videoOpen} onDismiss={() => setVideoOpen(false)} />
      <PrimaryLayout sx={{ maxWidth: 'page' }}>
        <Stack gap={[5, 6]}>
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
                  <PlayButton label="Maker Relay" onClick={() => setVideoOpen(true)} />
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
                          network={network}
                          votedProposals={[]}
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
              <GovernanceStats polls={polls} />
            </ErrorBoundary>
          </section>

          <section>
            <ActivePollsLanding activePolls={activePolls} />
            <PollCategoriesLanding pollCategories={pollCategories} />
          </section>

          <section>
            <ExecutiveProposalsLanding proposals={proposals} network={network} hat={hat} />
          </section>

          <section>
            <ErrorBoundary componentName="Meet Delegates">
              <MeetDelegates delegates={topDelegates} />
            </ErrorBoundary>
          </section>

          <section>
            <TopDelegates delegates={topDelegates} totalMKRDelegated={new BigNumber(totalMKRDelegated)} />
          </section>

          <section>
            <ErrorBoundary componentName="System Stats">
              <SystemStats />
            </ErrorBoundary>
          </section>
        </Stack>
      </PrimaryLayout>
    </div>
  );
};

export default function Index({
  proposals: prefetchedProposals,
  polls: prefetchedPolls,
  delegates: prefetchedDelegates,
  totalMKRDelegated: prefetchedTotalMKRDelegated
}: Props): JSX.Element {
  const { network } = useActiveWeb3React();

  const { cache } = useSWRConfig();

  // Fetch polls if networks change
  const dataKeyPolls =
    !network || isDefaultNetwork(network) ? null : `/api/polling/all-polls?network=${network}`;
  const { data: pollsData, error: errorPolls } = useSWR<PollsResponse>(dataKeyPolls, fetchJson, {
    revalidateOnMount: !cache.get(dataKeyPolls)
  });

  // Fetch executives if networks change
  const dataKeyProposals =
    !network || isDefaultNetwork(network)
      ? null
      : `/api/executive?network=${network}&start=0&limit=3&sortBy=active`;
  const { data: proposalsData, error: errorProposals } = useSWR<Proposal[]>(dataKeyProposals, fetchJson, {
    revalidateOnMount: !cache.get(dataKeyProposals)
  });

  // Fetch delegates if networks change
  const dataKeyDelegates =
    !network || isDefaultNetwork(network) ? null : `/api/delegates?network=${network}&sortBy=mkr`;
  const { data: delegatesData, error: errorDelegates } = useSWR<DelegatesAPIResponse>(
    dataKeyDelegates,
    fetchJson,
    {
      revalidateOnMount: !cache.get(dataKeyDelegates)
    }
  );

  // Error state, only applies for alternative networks
  if (errorProposals || errorPolls || errorDelegates) {
    return <ErrorPage statusCode={404} title="Error fetching home page information" />;
  }

  if (!isDefaultNetwork(network) && (!pollsData || !proposalsData || !delegatesData))
    return (
      <PrimaryLayout>
        <PageLoadingPlaceholder />
      </PrimaryLayout>
    );

  return (
    <LandingPage
      proposals={
        isDefaultNetwork(network)
          ? prefetchedProposals
          : proposalsData
          ? proposalsData.filter(p => p.active)
          : []
      }
      polls={isDefaultNetwork(network) ? prefetchedPolls : pollsData ? pollsData.polls : []}
      network={network}
      delegates={
        isDefaultNetwork(network) ? prefetchedDelegates : delegatesData ? delegatesData.delegates : []
      }
      totalMKRDelegated={
        isDefaultNetwork(network)
          ? prefetchedTotalMKRDelegated
          : delegatesData
          ? delegatesData.stats.totalMKRDelegated
          : '0'
      }
    />
  );
}

export const getStaticProps: GetStaticProps = async () => {
  // fetch polls, proposals at build-time
  const [proposals, pollsData] = await Promise.all([getExecutiveProposals(0, 3, 'active'), getPolls()]);

  const delegatesResponse = await fetchDelegates(SupportedNetworks.MAINNET, 'mkr');

  return {
    revalidate: 30 * 60, // allow revalidation every 30 minutes
    props: {
      proposals: proposals.filter(i => i.active),
      polls: pollsData.polls,
      delegates: delegatesResponse.delegates,
      totalMKRDelegated: delegatesResponse.stats.totalMKRDelegated
    }
  };
};
