/** @jsx jsx */
import React from 'react';
import { Heading, Flex, Box, Button, Divider, Grid, Text, Card, jsx } from 'theme-ui';
import { useEffect, useState, useMemo, useRef } from 'react';
import { GetStaticProps } from 'next';
import useSWR from 'swr';
import ErrorPage from 'next/error';
import Skeleton from 'react-loading-skeleton';
import shallow from 'zustand/shallow';
import Stack from '../components/layouts/Stack';
import ExecutiveOverviewCard from '../components/executive/ExecutiveOverviewCard';
import { getExecutiveProposals } from '../lib/api';
import getMaker, { isDefaultNetwork, getNetwork } from '../lib/maker';
import PrimaryLayout from '../components/layouts/Primary';
import Proposal, { CMSProposal } from '../types/proposal';
import SidebarLayout, { StickyColumn } from '../components/layouts/Sidebar';
import useAccountsStore from '../stores/accounts';
import useUiFiltersStore from '../stores/uiFilters';
import SpellData from '../types/spellData';
import { fetchJson } from '../lib/utils';

const ESModule = ({ }) => {
  // const account = useAccountsStore(state => state.currentAccount);
  // const voteProxy = useAccountsStore(state => (account ? state.proxies[account.address] : null));
  // const [numHistoricalProposalsLoaded, setNumHistoricalProposalsLoaded] = useState(5);
  // const [showHistorical, setShowHistorical] = React.useState(false);
  const loader = useRef<HTMLDivElement>(null);

  // const lockedMkrKey = voteProxy?.getProxyAddress() || account?.address;
  // const { data: lockedMkr } = useSWR(lockedMkrKey ? ['/user/mkr-locked', lockedMkrKey] : null, (_, address) =>
  //   getMaker().then(maker =>
  //     voteProxy ? voteProxy.getNumDeposits() : maker.service('chief').getNumDeposits(address)
  //   )
  // );

  // FIXME merge this into the proposal object
  // const { data: spellData } = useSWR<Record<string, SpellData>>(
  //   `/api/executive/analyze-spell?network=${getNetwork()}`,
  //   // needs to be a POST because the list of addresses is too long to be a GET query parameter
  //   url =>
  //     fetchJson(url, { method: 'POST', body: JSON.stringify({ addresses: proposals.map(p => p.address) }) }),
  //   { refreshInterval: 0 }
  // );

  // const [startDate, endDate, sortBy] = useUiFiltersStore(
  //   state => [state.executiveFilters.startDate, state.executiveFilters.endDate, state.executiveSortBy],
  //   shallow
  // );

  // const prevSortByRef = useRef<string>(sortBy);
  // useEffect(() => {
  //   if (sortBy !== prevSortByRef.current) {
  //     prevSortByRef.current = sortBy;
  //     setShowHistorical(true);
  //   }
  // }, [sortBy]);

  // const filteredProposals = useMemo(() => {
  //   const start = startDate && new Date(startDate);
  //   const end = endDate && new Date(endDate);
  //   return (proposals.filter(proposal => {
  //     // filter out non-cms proposals for now
  //     if (!('about' in proposal) || !('date' in proposal)) return false;
  //     if (start && new Date((proposal as CMSProposal).date).getTime() < start.getTime()) return false;
  //     if (end && new Date((proposal as CMSProposal).date).getTime() > end.getTime()) return false;
  //     return true;
  //   }) as CMSProposal[]).sort((a, b) => {
  //     if (sortBy === 'MKR Amount') {
  //       const bSupport = spellData ? spellData[b.address]?.mkrSupport || 0 : 0;
  //       const aSupport = spellData ? spellData[a.address]?.mkrSupport || 0 : 0;
  //       return bSupport - aSupport;
  //     }
  //     return new Date(b.date).getTime() - new Date(a.date).getTime();
  //   });
  // }, [proposals, startDate, endDate, sortBy]);

  // const loadMore = entries => {
  //   const target = entries.pop();
  //   if (target.isIntersecting) {
  //     setNumHistoricalProposalsLoaded(
  //       numHistoricalProposalsLoaded < filteredProposals.filter(proposal => !proposal.active).length
  //         ? numHistoricalProposalsLoaded + 5
  //         : numHistoricalProposalsLoaded
  //     );
  //   }
  // };

  // useEffect(() => {
  //   let observer;
  //   if (loader?.current) {
  //     observer = new IntersectionObserver(loadMore, { root: null, rootMargin: '600px' });
  //     observer.observe(loader.current);
  //   }
  //   return () => {
  //     if (loader?.current) {
  //       observer?.unobserve(loader.current);
  //     }
  //   };
  // }, [loader, loadMore]);

  // useEffect(() => {
  //   setNumHistoricalProposalsLoaded(5); // reset infinite scroll if a new filter is applied
  // }, [filteredProposals]);

  // const { data: hat } = useSWR<string>('/executive/hat', () =>
  //   getMaker().then(maker => maker.service('chief').getHat())
  // );

  return (
    <PrimaryLayout shortenFooter={true} sx={{ maxWidth: 'dashboard' }}>
      <Stack>
        <Text variant='heading'>
          Emergency Shutdown Module
        </Text>
        <Text variant='text'>
        The ESM allows MKR holders to shutdown the system without a central authority. Once 50,000 MKR are entered into the ESM, emergency shutdown can be executed. Read the documentation here.
        </Text>
        <Text variant='microHeading'>
        Total MKR Burned
        </Text>
        <Card>

        </Card>
        <Text variant='microHeading'>
        ESM History
        </Text>
        <Card>

        </Card>
      </Stack>
    </PrimaryLayout>
  );
};

export default function ESModulePage({
}): JSX.Element {
  // const [_proposals, _setProposals] = useState<Proposal[]>();
  const [error, setError] = useState<string>();

  // fetch proposals at run-time if on any network other than the default
  // useEffect(() => {
  //   if (!isDefaultNetwork()) {
  //     getExecutiveProposals().then(_setProposals).catch(setError);
  //   }
  // }, []);

  if (error) {
    return <ErrorPage statusCode={404} title="Error fetching ES module" />;
  }

  // if (!isDefaultNetwork() && !_proposals)
  if (!isDefaultNetwork())
    return (
      <PrimaryLayout>
        <p>Loading…</p>
      </PrimaryLayout>
    );

  return (
    <ESModule />
  );
}

export const getStaticProps: GetStaticProps = async () => {
  // fetch proposals at build-time if on the default network
  // const proposals = await getExecutiveProposals();

  return {
    unstable_revalidate: 30, // allow revalidation every 30 seconds
    props: {
      // proposals
    }
  };
};
