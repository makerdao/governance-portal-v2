import React from 'react';
import { Heading, Flex, Box, Button, Divider, Grid, Text, Badge, Link } from 'theme-ui';
import { useEffect, useState, useMemo, useRef } from 'react';
import useSWR from 'swr';
import { GetStaticProps } from 'next';
import ErrorPage from 'next/error';
import shallow from 'zustand/shallow';
import { Icon } from '@makerdao/dai-ui-icons';

// lib
import { getExecutiveProposals } from 'modules/executive/api/fetchExecutives';
import getMaker, { MKR } from 'lib/maker';
import { useLockedMkr } from 'modules/mkr/hooks/useLockedMkr';
import { useHat } from 'modules/executive/hooks/useHat';
import { useVotedProposals } from 'modules/executive/hooks/useVotedProposals';
import { fetchJson } from 'lib/fetchJson';
import oldChiefAbi from 'lib/abis/oldChiefAbi.json';

// components
import Deposit from 'modules/mkr/components/Deposit';
import WithdrawOldChief from 'modules/executive/components/WithdrawOldChief';
import ProposalsSortBy from 'modules/executive/components/ProposalsSortBy';
import DateFilter from 'modules/executive/components/DateFilter';
import SystemStatsSidebar from 'modules/app/components/SystemStatsSidebar';
import MkrLiquiditySidebar from 'modules/mkr/components/MkrLiquiditySidebar';
import ResourceBox from 'modules/app/components/ResourceBox';
import Stack from 'modules/app/components/layout/layouts/Stack';
import ExecutiveOverviewCard from 'modules/executive/components/ExecutiveOverviewCard';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import SidebarLayout from 'modules/app/components/layout/layouts/Sidebar';
import ProgressBar from 'modules/executive/components/ProgressBar';
import PageLoadingPlaceholder from 'modules/app/components/PageLoadingPlaceholder';
import { ExecutiveBalance } from 'modules/executive/components/ExecutiveBalance';

// stores
import useUiFiltersStore from 'modules/app/stores/uiFilters';

// types
import { Proposal, CMSProposal, SpellData } from 'modules/executive/types';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import { HeadComponent } from 'modules/app/components/layout/Head';
import { useAccount } from 'modules/app/hooks/useAccount';
import { useContractAddress } from 'modules/web3/hooks/useContractAddress';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { chainIdToNetworkName } from 'modules/web3/helpers/chain';
import { isDefaultNetwork } from 'modules/web3/helpers/isDefaultNetwork';

const CircleNumber = ({ children }) => (
  <Box
    sx={{
      width: '26px',
      minWidth: '26px',
      lineHeight: '26px',
      borderRadius: '50%',
      textAlign: 'center',
      fontSize: '12px',
      backgroundColor: 'primary',
      color: 'white',
      fontWeight: 'bold',
      mr: 3,
      my: 1,
      ml: [0, '-8px']
    }}
  >
    {children}
  </Box>
);

const MigrationBadge = ({ children, py = [2, 3] }) => (
  <Badge
    variant="primary"
    sx={{
      textTransform: 'none',
      borderColor: 'primary',
      borderRadius: 'small',
      width: '100%',
      whiteSpace: 'normal',
      fontWeight: 'normal',
      fontSize: [1, 2],
      px: [3, 4],
      my: 3,
      py
    }}
  >
    {children}
  </Badge>
);

export const ExecutiveOverview = ({ proposals }: { proposals: Proposal[] }): JSX.Element => {
  const { account, voteDelegateContractAddress, voteProxyContractAddress, voteProxyOldContractAddress } =
    useAccount();
  const oldChiefAddress = useContractAddress('chiefOld');
  const { chainId } = useActiveWeb3React();
  const network = chainIdToNetworkName(chainId);
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.EXECUTIVE);

  const [numHistoricalProposalsLoaded, setNumHistoricalProposalsLoaded] = useState(5);
  const [showHistorical, setShowHistorical] = React.useState(false);
  const loader = useRef<HTMLDivElement>(null);

  const address = voteDelegateContractAddress || voteProxyContractAddress || account;
  const { data: lockedMkr } = useLockedMkr(account, voteProxyContractAddress, voteDelegateContractAddress);

  const { data: votedProposals, mutate: mutateVotedProposals } = useVotedProposals();

  // revalidate votedProposals if connected address changes
  useEffect(() => {
    mutateVotedProposals();
  }, [address]);

  const lockedMkrKeyOldChief = voteProxyOldContractAddress || account;
  const { data: lockedMkrOldChief } = useSWR(
    lockedMkrKeyOldChief ? ['/user/mkr-locked-old-chief', lockedMkrKeyOldChief] : null,
    () =>
      getMaker().then(maker =>
        maker
          .service('smartContract')
          .getContractByAddressAndAbi(oldChiefAddress, oldChiefAbi)
          .deposits(lockedMkrKeyOldChief)
          .then(MKR.wei)
      )
  );

  // FIXME merge this into the proposal object
  const { data: spellData } = useSWR<Record<string, SpellData>>(
    `/api/executive/analyze-spell?network=${network}`,
    // needs to be a POST because the list of addresses is too long to be a GET query parameter
    url =>
      fetchJson(url, { method: 'POST', body: JSON.stringify({ addresses: proposals.map(p => p.address) }) }),
    { refreshInterval: 0, revalidateOnMount: true }
  );

  const votingForSomething = votedProposals && votedProposals.length > 0;

  const [startDate, endDate, sortBy] = useUiFiltersStore(
    state => [state.executiveFilters.startDate, state.executiveFilters.endDate, state.executiveSortBy],
    shallow
  );

  const prevSortByRef = useRef<string>(sortBy);
  useEffect(() => {
    if (sortBy !== prevSortByRef.current) {
      prevSortByRef.current = sortBy;
      setShowHistorical(true);
    }
  }, [sortBy]);

  const filteredProposals = useMemo(() => {
    const start = startDate && new Date(startDate);
    const end = endDate && new Date(endDate);
    return (
      proposals.filter(proposal => {
        // filter out non-cms proposals for now
        if (!('about' in proposal) || !('date' in proposal)) return false;
        if (start && new Date((proposal as CMSProposal).date).getTime() < start.getTime()) return false;
        if (end && new Date((proposal as CMSProposal).date).getTime() > end.getTime()) return false;
        return true;
      }) as CMSProposal[]
    ).sort((a, b) => {
      if (sortBy === 'MKR Amount') {
        const bSupport = spellData ? spellData[b.address]?.mkrSupport || 0 : 0;
        const aSupport = spellData ? spellData[a.address]?.mkrSupport || 0 : 0;
        return bSupport - aSupport;
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [proposals, startDate, endDate, sortBy]);

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
    setNumHistoricalProposalsLoaded(5); // reset infinite scroll if a new filter is applied
  }, [filteredProposals]);

  const { data: hat } = useHat();

  return (
    <PrimaryLayout shortenFooter={true} sx={{ maxWidth: [null, null, null, 'page', 'dashboard'] }}>
      <HeadComponent title="Executive Proposals" />

      <Box sx={{ mt: ['-10px', '-25px'] }}>
        {lockedMkrOldChief && lockedMkrOldChief.gt(0) && (
          <>
            <ProgressBar step={0} />
            <MigrationBadge py={[2]}>
              <Flex
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  alignContent: 'space-between',
                  flexWrap: 'wrap'
                }}
              >
                <Text sx={{ py: 2 }}>
                  An executive vote has passed to update the Chief to a new version. You have{' '}
                  <b>{lockedMkrOldChief.toBigNumber().toFormat(lockedMkrOldChief.gte(0.01) ? 2 : 6)} MKR</b>{' '}
                  to withdraw from the old chief.
                </Text>
                <Flex>
                  <WithdrawOldChief />
                  <Link href="https://forum.makerdao.com/t/dschief-v1-2-migration-steps/5412" target="_blank">
                    <Button
                      variant="outline"
                      sx={{
                        height: '26px',
                        py: 0,
                        px: 2,
                        ml: 1,
                        textTransform: 'uppercase',
                        borderRadius: 'small',
                        fontWeight: 'bold',
                        fontSize: '10px',
                        borderColor: 'accentBlue',
                        color: 'accentBlue',
                        ':hover': { color: 'blueLinkHover', borderColor: 'blueLinkHover' },
                        ':hover svg': { color: 'blueLinkHover' }
                      }}
                      onClick={() => {
                        trackButtonClick('chiefMigrationForumPostButton');
                      }}
                    >
                      <Text>
                        Forum Post <Icon name="arrowTopRight" size={2} ml={'1px'} color="accentBlue" />
                      </Text>
                    </Button>
                  </Link>
                </Flex>
              </Flex>
            </MigrationBadge>
          </>
        )}
        {lockedMkrOldChief &&
          lockedMkrOldChief.eq(0) &&
          !voteProxyContractAddress &&
          lockedMkr &&
          lockedMkr.eq(0) &&
          !voteDelegateContractAddress && (
            <>
              <ProgressBar step={1} />
              <Flex
                sx={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}
              >
                <Heading variant="microHeading">
                  Choose one of the options below to deposit MKR into the new chief:
                </Heading>
                <Link
                  href="https://forum.makerdao.com/t/dschief-v1-2-migration-steps/5412"
                  target="_blank"
                  sx={{ color: 'accentBlue', fontSize: 3, ':hover': { color: 'blueLinkHover' } }}
                  onClick={() => {
                    trackButtonClick('chiefMigrationMoreInfoLink');
                  }}
                >
                  <Flex sx={{ alignItems: 'center' }}>
                    <Text>
                      More info
                      <Icon ml={2} name="arrowTopRight" size={2} />
                    </Text>
                  </Flex>
                </Link>
              </Flex>
              <MigrationBadge py={[0]}>
                <Flex
                  sx={{
                    flexDirection: 'column',
                    py: 2
                  }}
                >
                  <Flex sx={{ alignItems: 'center' }}>
                    <CircleNumber> 1 </CircleNumber>
                    <Text>
                      <b>Hot wallet only: </b>
                      <Deposit link={'Click here'} /> to deposit your MKR directly into the new Chief without
                      using a vote proxy.
                    </Text>
                  </Flex>
                  <Divider />
                  <Flex sx={{ alignItems: 'center' }}>
                    <CircleNumber> 2 </CircleNumber>
                    <Text>
                      <b>Hot and cold wallet: </b>
                      <Link
                        href="https://v1.vote.makerdao.com/proxysetup"
                        sx={{ textDecoration: 'underline' }}
                        onClick={() => {
                          trackButtonClick('chiefMigrationLinkToProxySetup');
                        }}
                      >
                        Click here
                      </Link>{' '}
                      to create a vote proxy for additional wallet security. More info{' '}
                      <Link
                        href="https://blog.makerdao.com/the-makerdao-voting-proxy-contract/"
                        target="_blank"
                        sx={{ textDecoration: 'underline' }}
                        onClick={() => {
                          trackButtonClick('chiefMigrationLinkToVoteProxyBlog');
                        }}
                      >
                        here
                      </Link>
                      .
                    </Text>
                  </Flex>
                </Flex>
              </MigrationBadge>
            </>
          )}
        {votedProposals &&
          !votingForSomething &&
          lockedMkrOldChief &&
          lockedMkrOldChief.eq(0) &&
          voteProxyContractAddress &&
          lockedMkr &&
          !voteDelegateContractAddress && (
            <>
              <ProgressBar step={lockedMkr.eq(0) ? 1 : 2} />
              <MigrationBadge>
                {lockedMkr.eq(0) ? (
                  <Text>
                    Your vote proxy has been created. Please <Deposit link={'deposit'} /> into your new vote
                    proxy contract
                  </Text>
                ) : (
                  'Your vote proxy has been created. You are now ready to vote.'
                )}
              </MigrationBadge>
            </>
          )}
        {votedProposals &&
          !votingForSomething &&
          lockedMkrOldChief &&
          lockedMkrOldChief.eq(0) &&
          !voteProxyContractAddress &&
          lockedMkr &&
          lockedMkr.gt(0) && (
            <>
              <ProgressBar step={2} />
              <MigrationBadge>Your MKR has been deposited. You are now ready to vote.</MigrationBadge>
            </>
          )}
      </Box>
      <Stack>
        {account && <ExecutiveBalance lockedMkr={lockedMkr} voteDelegate={voteDelegateContractAddress} />}
        <Flex sx={{ alignItems: 'center' }}>
          <Heading variant="microHeading" mr={3} sx={{ display: ['none', 'block'] }}>
            Filters
          </Heading>
          <ProposalsSortBy sx={{ mr: 3 }} />
          <DateFilter />
        </Flex>

        <SidebarLayout>
          <Box>
            <Stack gap={3}>
              <Heading as="h1">Executive Proposals</Heading>
              <Stack gap={4} sx={{ mb: 4 }}>
                {filteredProposals
                  .filter(proposal => proposal.active)
                  .map((proposal, index) => (
                    <ExecutiveOverviewCard
                      key={index}
                      proposal={proposal}
                      spellData={spellData ? spellData[proposal.address] : undefined}
                      isHat={hat ? hat.toLowerCase() === proposal.address.toLowerCase() : false}
                    />
                  ))}
              </Stack>

              {showHistorical ? (
                <div>
                  <Grid mb={4} columns="1fr max-content 1fr" sx={{ alignItems: 'center' }}>
                    <Divider />
                    <Button
                      variant="mutedOutline"
                      onClick={() => {
                        trackButtonClick('hideHistoricalExecs');
                        setShowHistorical(false);
                      }}
                    >
                      View fewer proposals
                    </Button>
                    <Divider />
                  </Grid>

                  <Stack gap={4}>
                    {filteredProposals
                      .filter(proposal => !proposal.active)
                      .slice(0, numHistoricalProposalsLoaded)
                      .map((proposal, index) => (
                        <ExecutiveOverviewCard
                          key={index}
                          proposal={proposal}
                          spellData={spellData ? spellData[proposal.address] : undefined}
                          isHat={hat ? hat.toLowerCase() === proposal.address.toLowerCase() : false}
                        />
                      ))}
                  </Stack>
                  <div ref={loader} />
                </div>
              ) : (
                <Grid columns="1fr max-content 1fr" sx={{ alignItems: 'center' }}>
                  <Divider />
                  <Button
                    variant="mutedOutline"
                    onClick={() => {
                      trackButtonClick('showHistoricalExecs');
                      setShowHistorical(true);
                    }}
                  >
                    View more proposals
                  </Button>
                  <Divider />
                </Grid>
              )}
            </Stack>
          </Box>
          <Stack gap={3}>
            <SystemStatsSidebar
              fields={[
                'chief contract',
                'mkr in chief',
                'mkr needed to pass',
                'savings rate',
                'total dai',
                'debt ceiling'
              ]}
            />
            <MkrLiquiditySidebar />
            <ResourceBox type={'executive'} />
            <ResourceBox type={'general'} />
          </Stack>
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
  const { chainId } = useActiveWeb3React();

  // fetch proposals at run-time if on any network other than the default
  useEffect(() => {
    if (!chainId) return;
    if (!isDefaultNetwork(chainId)) {
      fetchJson(`/api/executive?network=${chainIdToNetworkName(chainId)}`)
        .then(_setProposals)
        .catch(setError);
    }
  }, [chainId]);

  if (error) {
    return <ErrorPage statusCode={404} title="Error fetching proposals" />;
  }

  if (!isDefaultNetwork(chainId) && !_proposals)
    return (
      <PrimaryLayout shortenFooter={true}>
        <PageLoadingPlaceholder />
      </PrimaryLayout>
    );

  return (
    <ExecutiveOverview
      proposals={isDefaultNetwork(chainId) ? prefetchedProposals : (_proposals as Proposal[])}
    />
  );
}

export const getStaticProps: GetStaticProps = async () => {
  // fetch proposals at build-time if on the default network
  const proposals = await getExecutiveProposals();

  return {
    revalidate: 30, // allow revalidation every 30 seconds
    props: {
      proposals
    }
  };
};
