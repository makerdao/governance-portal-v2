/** @jsx jsx */
import React from 'react';
import { Heading, Flex, Box, Button, Divider, Grid, Text, jsx } from 'theme-ui';
import { useEffect, useState, useMemo, useRef } from 'react';
import { GetStaticProps } from 'next';
import useSWR from 'swr';
import ErrorPage from 'next/error';
import Skeleton from 'react-loading-skeleton';
import shallow from 'zustand/shallow';

import SortBy from '../components/executive/SortBy';
import DateFilter from '../components/executive/DateFilter';
import SystemStatsSidebar from '../components/SystemStatsSidebar';
import ResourceBox from '../components/ResourceBox';
import Stack from '../components/layouts/Stack';
import ExecutiveOverviewCard from '../components/executive/ExecutiveOverviewCard';
import VoteModal from '../components/executive/VoteModal';
import { getExecutiveProposals } from '../lib/api';
import getMaker, { isDefaultNetwork } from '../lib/maker';
import PrimaryLayout from '../components/layouts/Primary';
import Proposal, { CMSProposal } from '../types/proposal';
import SidebarLayout, { StickyColumn } from '../components/layouts/Sidebar';
import useAccountsStore from '../stores/accounts';
import useUiFiltersStore from '../stores/uiFilters';

const ExecutiveOverview = ({ proposals }: { proposals: Proposal[] }) => {
  const account = useAccountsStore(state => state.currentAccount);
  const [numHistoricalProposalsLoaded, setNumHistoricalProposalsLoaded] = useState(5);
  const [showDialog, setShowDialog] = React.useState(false);
  const [showHistorical, setShowHistorical] = React.useState(false);
  const [proposal, setProposal] = React.useState({});
  const open = (proposal: Proposal) => {
    setProposal(proposal);
    setShowDialog(true);
  };
  const loader = useRef<HTMLDivElement>(null);
  const close = () => setShowDialog(false);

  const { data: lockedMkr } = useSWR(
    account?.address ? ['/user/mkr-locked', account.address] : null,
    (_, address) => getMaker().then(maker => maker.service('chief').getNumDeposits(address))
  );

  const [startDate, endDate, executiveSortBy] = useUiFiltersStore(
    state => [state.executiveFilters.startDate, state.executiveFilters.endDate, state.executiveSortBy],
    shallow
  );

  const prevSortByRef = useRef<string>(executiveSortBy);
  useEffect(() => {
    if (executiveSortBy !== prevSortByRef.current) {
      prevSortByRef.current = executiveSortBy;
      setShowHistorical(true);
    }
  }, [executiveSortBy]);

  const filteredProposals = useMemo(() => {
    const start = startDate && new Date(startDate);
    const end = endDate && new Date(endDate);
    return (proposals.filter(proposal => {
      // filter out non-cms proposals for now
      if (!('about' in proposal) || !('date' in proposal)) return false;
      if (start && new Date((proposal as CMSProposal).date).getTime() < start.getTime()) return false;
      if (end && new Date((proposal as CMSProposal).date).getTime() > end.getTime()) return false;
      return true;
    }) as CMSProposal[]).sort((a, b) => {
      // MKR amount sort TODO
      if (executiveSortBy === 'MKR Amount') return new Date(b.date).getTime() - new Date(a.date).getTime();
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [proposals, startDate, endDate]) as CMSProposal[];

  const loadMore = entries => {
    const target = entries.pop();
    if (target.isIntersecting) {
      setNumHistoricalProposalsLoaded(
        numHistoricalProposalsLoaded < filteredProposals.filter(proposal => !proposal.active).length
          ? numHistoricalProposalsLoaded + 5
          : numHistoricalProposalsLoaded
      );
    }
  };

  useEffect(() => {
    let observer;
    if (loader?.current) {
      observer = new IntersectionObserver(loadMore, { root: null, rootMargin: '600px' });
      observer.observe(loader.current);
    }
    return () => {
      if (loader?.current) {
        observer?.unobserve(loader.current);
      }
    };
  }, [loader, loadMore]);

  useEffect(() => {
    setNumHistoricalProposalsLoaded(5); // reset inifite scroll if a new filter is applied
  }, [filteredProposals]);

  return (
    <PrimaryLayout shortenFooter={true}>
      <VoteModal showDialog={showDialog} close={close} proposal={proposal} />
      <Stack>
        {account && (
          <Flex sx={{ alignItems: 'center' }}>
            <Flex>
              <Text>In voting contract: </Text>
              {lockedMkr ? (
                <Text sx={{ fontWeight: 'bold' }}>{lockedMkr.toBigNumber().toFormat(6)} MKR</Text>
              ) : (
                <Box sx={{ width: 6 }}>
                  <Skeleton />
                </Box>
              )}
            </Flex>
            <Button variant="mutedOutline" ml={3}>
              Deposit
            </Button>
            <Button variant="mutedOutline" ml={3}>
              Withdraw
            </Button>
          </Flex>
        )}

        <Flex sx={{ alignItems: 'center' }}>
          <Heading variant="microHeading" sx={{ mr: 3 }}>
            Filters
          </Heading>
          <SortBy sx={{ mr: 3 }} />
          <DateFilter />
        </Flex>

        <SidebarLayout>
          <Box>
            <Stack gap={3}>
              <Heading as="h1">Active Executive Proposals</Heading>
              <Stack gap={4} sx={{ mb: 4 }}>
                {filteredProposals
                  .filter(proposal => proposal.active)
                  .map((proposal, index) => (
                    <ExecutiveOverviewCard
                      key={index}
                      proposal={proposal}
                      openVoteModal={() => open(proposal)}
                    />
                  ))}
              </Stack>

              {showHistorical ? (
                <div>
                  <Heading mb={3} as="h4">
                    <Flex sx={{ justifyContent: 'space-between' }}>
                      Historical Proposals
                      <Button onClick={() => setShowHistorical(false)} variant="mutedOutline">
                        Hide historical proposals
                      </Button>
                    </Flex>
                  </Heading>
                  <Stack gap={4}>
                    {filteredProposals
                      .filter(proposal => !proposal.active)
                      .slice(0, numHistoricalProposalsLoaded)
                      .map((proposal, index) => (
                        <ExecutiveOverviewCard
                          key={index}
                          proposal={proposal}
                          openVoteModal={() => open(proposal)}
                        />
                      ))}
                  </Stack>
                  <div ref={loader} />
                </div>
              ) : (
                <Grid columns="1fr max-content 1fr" sx={{ alignItems: 'center' }}>
                  <Divider />
                  <Button variant="mutedOutline" onClick={() => setShowHistorical(true)}>
                    View more proposals
                  </Button>
                  <Divider />
                </Grid>
              )}
            </Stack>
          </Box>
          <StickyColumn>
            <Stack gap={3}>
              <SystemStatsSidebar
                fields={['mkr needed to pass', 'savings rate', 'total dai', 'debt ceiling']}
              />
              <ResourceBox />
            </Stack>
          </StickyColumn>
        </SidebarLayout>
      </Stack>
    </PrimaryLayout>
  );
};

export default function ExecutiveOverviewPage({
  proposals: prefetchedProposals
}: {
  proposals: Proposal[];
}): JSX.Element {
  const [_proposals, _setProposals] = useState<Proposal[]>();
  const [error, setError] = useState<string>();

  // fetch proposals at run-time if on any network other than the default
  useEffect(() => {
    if (!isDefaultNetwork()) {
      getExecutiveProposals().then(_setProposals).catch(setError);
    }
  }, []);

  if (error) {
    return <ErrorPage statusCode={404} title="Error fetching proposals" />;
  }

  if (!isDefaultNetwork() && !_proposals)
    return (
      <PrimaryLayout>
        <p>Loading…</p>
      </PrimaryLayout>
    );

  return (
    <ExecutiveOverview proposals={isDefaultNetwork() ? prefetchedProposals : (_proposals as Proposal[])} />
  );
}

export const getStaticProps: GetStaticProps = async () => {
  // fetch proposals at build-time if on the default network
  const proposals = await getExecutiveProposals();

  return {
    unstable_revalidate: 30, // allow revalidation every 30 seconds
    props: {
      proposals
    }
  };
};
