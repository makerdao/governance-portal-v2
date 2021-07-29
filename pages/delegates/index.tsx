/** @jsx jsx */
import { useState, useEffect } from 'react';
import { Heading, Box, Text, jsx } from 'theme-ui';
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
import useAccountsStore from 'stores/accounts';

type Props = {
  delegates: Delegate[];
};

const Delegates = ({ delegates }: Props) => {
  const styles = {
    delegateGroup: {
      marginBottom: 2
    }
  };
  const voteDelegate = useAccountsStore(state => state.voteDelegate);
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
              <Heading mb={3} mt={4} as="h4">
                Recognized delegates
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
              <Heading mb={3} mt={4} as="h4">
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
              <Heading mb={3} mt={4} as="h4">
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
          <SystemStatsSidebar
            fields={['polling contract', 'savings rate', 'total dai', 'debt ceiling', 'system surplus']}
          />
          <ResourceBox />
        </Stack>
      </SidebarLayout>
    </PrimaryLayout>
  );
};

export default function DelegatesPage({ delegates }: Props): JSX.Element {
  const [_delegates, _setDelegates] = useState<Delegate[]>();
  const [error, setError] = useState<string>();

  // fetch delegates at run-time if on any network other than the default
  useEffect(() => {
    if (!isDefaultNetwork()) {
      fetchJson(`/api/delegates?network=${getNetwork()}`).then(_setDelegates).catch(setError);
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

  return <Delegates delegates={isDefaultNetwork() ? delegates : (_delegates as Delegate[])} />;
}

export const getStaticProps: GetStaticProps = async () => {
  const delegates = await fetchDelegates();

  return {
    revalidate: 30, // allow revalidation every 30 seconds
    props: {
      delegates: shuffleArray(delegates)
    }
  };
};
