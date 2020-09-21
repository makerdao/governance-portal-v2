/** @jsx jsx */
import React from 'react';
import { Heading, Flex, Box, Button, Divider, Grid, Text, jsx } from 'theme-ui';
import { useEffect, useState } from 'react';
import { GetStaticProps } from 'next';
import useSWR from 'swr';
import ErrorPage from 'next/error';
import Skeleton from 'react-loading-skeleton';
import SystemStatsSidebar from '../components/SystemStatsSidebar';
import ResourceBox from '../components/ResourceBox';
import Stack from '../components/layouts/Stack';
import ExecutiveOverviewCard from '../components/executive/ExecutiveOverviewCard';
import { getExecutiveProposals } from '../lib/api';
import getMaker, { isDefaultNetwork } from '../lib/maker';
import PrimaryLayout from '../components/layouts/Primary';
import Proposal from '../types/proposal';
import SidebarLayout, { StickyColumn } from '../components/layouts/Sidebar';
import useAccountsStore from '../stores/accounts';

const ExecutiveOverview = ({ proposals }: { proposals: Proposal[] }) => {
  const account = useAccountsStore(state => state.currentAccount);
  const { data: lockedMkr } = useSWR(
    account?.address ? ['/user/mkr-locked', account.address] : null,
    (_, address) => getMaker().then(maker => maker.service('chief').getNumDeposits(address))
  );

  return (
    <PrimaryLayout shortenFooter={true} sx={{ maxWidth: '1380px' }}>
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
          <Heading variant="microHeading" mr={3}>
            Filters
          </Heading>
        </Flex>

        <SidebarLayout>
          <Box>
            <Stack gap={3}>
              <Heading as="h1">Executive Proposals</Heading>
              <Stack gap={3}>
                {proposals.map(proposal => (
                  <ExecutiveOverviewCard key={proposal.address} proposal={proposal} />
                ))}
              </Stack>
              <Grid columns="1fr max-content 1fr" sx={{ alignItems: 'center' }}>
                <Divider />
                <Button variant="mutedOutline">View more proposals</Button>
                <Divider />
              </Grid>
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
