import { useState, useEffect } from 'react';
import { Heading, Box, Card, Text, Link as ThemeUILInk } from 'theme-ui';
import { GetStaticProps } from 'next';
import ErrorPage from 'next/error';
import { isDefaultNetwork } from 'lib/maker';
import { fetchDelegates } from 'modules/delegates/api/fetchDelegates';
import { DelegateStatusEnum } from 'modules/delegates/delegates.constants';
import { shuffleArray } from 'lib/common/shuffleArray';
import { Delegate, DelegatesAPIResponse, DelegatesAPIStats } from 'modules/delegates/types';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import SidebarLayout from 'modules/app/components/layout/layouts/Sidebar';
import Stack from 'modules/app/components/layout/layouts/Stack';
import ResourceBox from 'modules/app/components/ResourceBox';
import { DelegateCard } from 'modules/delegates/components';
import PageLoadingPlaceholder from 'modules/app/components/PageLoadingPlaceholder';
import { getNetwork } from 'lib/maker';
import { fetchJson } from 'lib/fetchJson';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import useAccountsStore from 'stores/accounts';
import Link from 'next/link';
import { DelegatesSystemInfo } from 'modules/delegates/components/DelegatesSystemInfo';
import { HeadComponent } from 'modules/app/components/layout/Head';

type Props = {
  delegates: Delegate[];
  stats: DelegatesAPIStats;
};

const Delegates = ({ delegates, stats }: Props) => {
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
      <HeadComponent
        title="Delegates"
        description="Vote delegation allows for MKR holders to delegate their voting power to delegates, which increases the effectiveness and efficiency of the governance process."
        image={'https://vote.makerdao.com/seo/delegates.png'}
      />

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
                    <DelegateCard delegate={delegate} />
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
                    <DelegateCard delegate={delegate} />
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
                    <DelegateCard delegate={delegate} />
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
          <ResourceBox type={'delegates'} />
          <ResourceBox type={'general'} />
        </Stack>
      </SidebarLayout>
    </PrimaryLayout>
  );
};

export default function DelegatesPage({ delegates, stats }: Props): JSX.Element {
  const [_delegates, _setDelegates] = useState<Delegate[]>();
  const [_stats, _setStats] = useState<DelegatesAPIStats>();
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
    />
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const delegatesAPIResponse = await fetchDelegates();

  return {
    revalidate: 30, // allow revalidation every 30 seconds
    props: {
      // Shuffle in the backend, this will be changed depending on the sorting order.
      delegates: shuffleArray(delegatesAPIResponse.delegates),
      stats: delegatesAPIResponse.stats
    }
  };
};
