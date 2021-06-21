/** @jsx jsx */
import { Heading, Box, jsx, Flex } from 'theme-ui';
import ErrorPage from 'next/error';
import { GetStaticPaths, GetStaticProps } from 'next';


import PrimaryLayout from '../../components/layouts/Primary';
import SidebarLayout from '../../components/layouts/Sidebar';
import Stack from '../../components/layouts/Stack';
import SystemStatsSidebar from '../../components/SystemStatsSidebar';
import ResourceBox from '../../components/ResourceBox';

import Head from 'next/head';
import { Delegate } from 'types/delegate';
import DelegateDetail from '../../components/delegations/DelegateDetail';
import { fetchDelegate, fetchDelegates } from '../../lib/delegates/fetchDelegates';


const DelegateView = ({ delegate }: {
  delegate: Delegate;
}) => {

  return (
    <PrimaryLayout shortenFooter={true} sx={{ maxWidth: [null, null, null, 'page', 'dashboard'] }}>
      <Head>
        <title>Maker Governance - Delegate Information</title>
      </Head>

      <SidebarLayout>
        <Box>
          <Flex sx={{ alignItems: 'center' }}>
            <Heading variant="microHeading" mr={3}>
              Back to delegates
            </Heading>
            
          </Flex>

  
          <Box>
            <DelegateDetail delegate={delegate} />
          </Box>
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

export default function DelegatesPage({ delegate }: {
  delegate?: Delegate;
}): JSX.Element {
  if (!delegate) {
    return <ErrorPage
      statusCode={404}
      title="Delegate address not found."
    />;
  }

  return <DelegateView delegate={delegate} />;
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const delegate = await fetchDelegate(params?.address as string);
  
  if (!delegate ) {
    return { revalidate: 30, props: { delegate : null } };
  }

  return {
    revalidate: 30, // allow revalidation every 30 seconds
    props: {
      delegate
    }
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const delegates = await fetchDelegates();
  const paths = delegates.map(d => `/delegates/${d.address}`);

  return {
    paths,
    fallback: true
  };
};
