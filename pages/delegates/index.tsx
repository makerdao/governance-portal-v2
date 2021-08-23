/** @jsx jsx */
import { useState, useEffect } from 'react';
import { Heading, Box, Card, Text, Link as ThemeUILInk, jsx } from 'theme-ui';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import ErrorPage from 'next/error';
import { isDefaultNetwork } from 'lib/maker';
import { fetchDelegates } from 'lib/delegates/fetchDelegates';
import { DelegateStatusEnum } from 'lib/delegates/constants';
import { shuffleArray } from 'lib/common/shuffleArray';
import { Delegate } from 'types/delegate';
import PrimaryLayout from 'components/layouts/Primary';
import SidebarLayout from 'components/layouts/Sidebar';
import Stack from 'components/layouts/Stack';
import SystemStatsSidebar from 'components/SystemStatsSidebar';
import ResourceBox from 'components/ResourceBox';
import { DelegateCard } from 'components/delegations';
import PageLoadingPlaceholder from 'components/PageLoadingPlaceholder';
import { getNetwork } from 'lib/maker';
import { fetchJson } from 'lib/utils';
import { useAnalytics } from 'lib/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'lib/client/analytics/analytics.constants';
import useAccountsStore from 'stores/accounts';
import Link from 'next/link';
import { DelegatesSystemInfo } from 'components/delegations/DelegatesSystemInfo';
import { DelegatesAPIResponse, DelegatesAPIStats } from 'types/delegatesAPI';
import { getExecutiveProposals } from 'modules/executives/api/fetchExecutives';
import { CMSProposal } from 'types/proposal';

type Props = {
  delegates: Delegate[];
  stats: DelegatesAPIStats;
  proposals: CMSProposal[];
};

const Delegates = ({ delegates, stats, proposals }: Props) => {
  const network = getNetwork();

  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.DELEGATES);

  const styles = {
    delegateGroup: {
      marginBottom: 2
    }
  };
  const [voteDelegate] = useAccountsStore(state => [state.voteDelegate]);

  const isOwner = d =>
    d.voteDelegateAddress.toLowerCase() === voteDelegate?.getVoteDelegateAddress().toLowerCase();

  const expiredDelegates = delegates.filter(delegate => delegate.expired === true);

  const recognizedDelegates = delegates
    .filter(delegate => delegate.status === DelegateStatusEnum.recognized && !delegate.expired)
    .sort(d => (isOwner(d) ? -1 : 0));

  const shadowDelegates = delegates
    .filter(delegate => delegate.status === DelegateStatusEnum.shadow && !delegate.expired)
    .sort(d => (isOwner(d) ? -1 : 0));

  return (
    <PrimaryLayout shortenFooter={true} sx={{ maxWidth: [null, null, null, 'page', 'dashboard'] }}>
      <Head>
        <title>Maker Governance - Delegates</title>
      </Head>

      <SidebarLayout>
        <Box>
          {delegates && delegates.length === 0 && <Text>No delegates found</Text>}
          {recognizedDelegates.length > 0 && (
            <Box sx={styles.delegateGroup}>
              <Heading mb={3} mt={3} as="h4">
                Recognized Delegates
              </Heading>

              <Box>
                {recognizedDelegates.map(delegate => (
                  <Box key={delegate.id} sx={{ mb: 4 }}>
                    <DelegateCard delegate={delegate} proposals={proposals} />
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {shadowDelegates.length > 0 && (
            <Box sx={styles.delegateGroup}>
              <Heading mb={3} mt={3} as="h4">
                Shadow Delegates
              </Heading>

              <Box>
                {shadowDelegates.map(delegate => (
                  <Box key={delegate.id} sx={{ mb: 4 }}>
                    <DelegateCard delegate={delegate} proposals={proposals} />
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {expiredDelegates.length > 0 && (
            <Box sx={styles.delegateGroup}>
              <Heading mb={3} mt={3} as="h4">
                Expired Delegates
              </Heading>

              <Box>
                {expiredDelegates.map(delegate => (
                  <Box key={delegate.id} sx={{ mb: 4 }}>
                    <DelegateCard delegate={delegate} proposals={proposals} />
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
        <Stack gap={3}>
          <Box>
            <Heading mt={3} mb={2} as="h3" variant="microHeading">
              Delegate Contracts
            </Heading>
            <Card variant="compact">
              <Text as="p" sx={{ mb: 3 }}>
                {voteDelegate
                  ? 'Looking for delegate contract information?'
                  : 'Interested in creating a delegate contract?'}
              </Text>
              <Box>
                <Link
                  href={{
                    pathname: '/account',
                    query: { network }
                  }}
                  passHref
                >
                  <ThemeUILInk onClick={() => trackButtonClick('viewAccount')} title="My account">
                    <Text>View Account Page</Text>
                  </ThemeUILInk>
                </Link>
              </Box>
            </Card>
          </Box>

          {stats && <DelegatesSystemInfo stats={stats} />}

          <SystemStatsSidebar
            fields={['polling contract', 'savings rate', 'total dai', 'debt ceiling', 'system surplus']}
          />
          <ResourceBox />
        </Stack>
      </SidebarLayout>
    </PrimaryLayout>
  );
};

export default function DelegatesPage({ delegates, stats, proposals }: Props): JSX.Element {
  const [_delegates, _setDelegates] = useState<Delegate[]>();
  const [_stats, _setStats] = useState<DelegatesAPIStats>();
  const [_proposals, _setProposals] = useState<CMSProposal[]>();
  const [error, setError] = useState<string>();

  // fetch delegates at run-time if on any network other than the default
  useEffect(() => {
    if (!isDefaultNetwork()) {
      fetchJson(`/api/delegates?network=${getNetwork()}`)
        .then((response: DelegatesAPIResponse) => {
          _setDelegates(response.delegates);
          _setStats(response.stats);
        })
        .catch(setError);
      getExecutiveProposals().then(_setProposals).catch(setError);
    }
  }, []);

  if (error) {
    return <ErrorPage statusCode={404} title="Error fetching delegates" />;
  }

  if (!isDefaultNetwork() && !_delegates) {
    return (
      <PrimaryLayout shortenFooter={true}>
        <PageLoadingPlaceholder />
      </PrimaryLayout>
    );
  }

  return (
    <Delegates
      delegates={isDefaultNetwork() ? delegates : (_delegates as Delegate[])}
      stats={isDefaultNetwork() ? stats : (_stats as DelegatesAPIStats)}
      proposals={isDefaultNetwork() ? proposals : (_proposals as CMSProposal[])}
    />
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const delegatesAPIResponse = await fetchDelegates();
  const proposals = await getExecutiveProposals();

  return {
    revalidate: 30, // allow revalidation every 30 seconds
    props: {
      // Shuffle in the backend, this will be changed depending on the sorting order.
      delegates: shuffleArray(delegatesAPIResponse.delegates),
      stats: delegatesAPIResponse.stats,
      proposals
    }
  };
};
