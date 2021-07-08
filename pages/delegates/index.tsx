/** @jsx jsx */
import { useState, useEffect } from 'react';
import { Heading, Box, Text, jsx } from 'theme-ui';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import ErrorPage from 'next/error';
import { isDefaultNetwork } from 'lib/maker';
import { fetchDelegates } from 'lib/delegates/fetchDelegates';
import { DelegateStatusEnum } from 'lib/delegates/constants';
import { Delegate } from 'types/delegate';
import PrimaryLayout from 'components/layouts/Primary';
import SidebarLayout from 'components/layouts/Sidebar';
import Stack from 'components/layouts/Stack';
import SystemStatsSidebar from 'components/SystemStatsSidebar';
import ResourceBox from 'components/ResourceBox';
import DelegateCard from 'components/delegations/DelegateCard';

type Props = {
  delegates: Delegate[];
};

const Delegates = ({ delegates }: Props) => {

  const styles = {
    delegateGroup: {
      marginBottom: 2
    }
  };

  const expiredDelegates = delegates.filter(delegate => delegate.expired === true);
  const activeDelegates = delegates.filter(
    delegate => delegate.status === DelegateStatusEnum.active && !delegate.expired
  );
  const unrecognizedDelegates = delegates.filter(
    delegate => delegate.status === DelegateStatusEnum.unrecognized && !delegate.expired
  );

  return (
    <PrimaryLayout shortenFooter={true} sx={{ maxWidth: [null, null, null, 'page', 'dashboard'] }}>
      <Head>
        <title>Maker Governance - Delegates</title>
      </Head>

      <SidebarLayout>
        <Box>
          {delegates && delegates.length === 0 && <Text>No delegates found</Text>}
          {activeDelegates.length > 0 && (
            <Box sx={styles.delegateGroup}>
              <Heading mb={3} mt={4} as="h4">
                Recognized delegates
              </Heading>

              <Box>
                {activeDelegates.map(delegate => (
                  <Box key={delegate.id} sx={{ mb: 4 }}>
                    <DelegateCard delegate={delegate} />
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {unrecognizedDelegates.length > 0 && (
            <Box sx={styles.delegateGroup}>
              <Heading mb={3} mt={4} as="h4">
                Unrecognized Delegates
              </Heading>

              <Box>
                {unrecognizedDelegates.map(delegate => (
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

  // fetch polls at run-time if on any network other than the default
  useEffect(() => {
    if (!isDefaultNetwork()) {
      fetchDelegates().then(_setDelegates).catch(setError);
    }
  }, []);

  if (error) {
    return <ErrorPage statusCode={404} title="Error fetching delegates" />;
  }

  if (!isDefaultNetwork() && !_delegates) {
    return (
      <PrimaryLayout>
        <p>Loading…</p>
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
      delegates
    }
  };
};
