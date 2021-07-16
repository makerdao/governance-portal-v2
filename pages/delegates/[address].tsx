/** @jsx jsx */
import { Heading, Box, jsx, Flex, NavLink, Button } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import ErrorPage from 'next/error';
import Link from 'next/link';
import Head from 'next/head';
import { GetStaticPaths, GetStaticProps } from 'next';
import { Icon } from '@makerdao/dai-ui-icons';
import { fetchDelegate, fetchDelegates } from 'lib/delegates/fetchDelegates';
import { getNetwork } from 'lib/maker';
import { Delegate } from 'types/delegate';
import PrimaryLayout from 'components/layouts/Primary';
import SidebarLayout from 'components/layouts/Sidebar';
import Stack from 'components/layouts/Stack';
import SystemStatsSidebar from 'components/SystemStatsSidebar';
import ResourceBox from 'components/ResourceBox';
import { DelegateDetail } from 'components/delegations';

const DelegateView = ({ delegate }: { delegate: Delegate }) => {
  const network = getNetwork();
  const bpi = useBreakpointIndex({ defaultIndex: 2 });

  return (
    <PrimaryLayout shortenFooter={true} sx={{ maxWidth: [null, null, null, 'page', 'dashboard'] }}>
      <Head>
        <title>Maker Governance - Delegate Information</title>
      </Head>

      <SidebarLayout>
        <Stack gap={2}>
          <Flex sx={{ alignItems: 'center' }}>
            <Heading variant="microHeading" mr={3}>
              <Link scroll={false} href={{ pathname: '/delegates', query: { network } }}>
                <NavLink p={0}>
                  <Button variant="mutedOutline">
                    <Flex sx={{ alignItems: 'center', whiteSpace: 'nowrap' }}>
                      <Icon name="chevron_left" size={2} mr={2} />
                      {bpi > 0 ? 'Back to all delegates' : 'Back'}
                    </Flex>
                  </Button>
                </NavLink>
              </Link>
            </Heading>
          </Flex>

          <Box>
            <DelegateDetail delegate={delegate} />
          </Box>
        </Stack>
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

export default function DelegatesPage({ delegate }: { delegate?: Delegate }): JSX.Element {
  if (!delegate) {
    return <ErrorPage statusCode={404} title="Delegate address not found." />;
  }

  return <DelegateView delegate={delegate} />;
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const delegate = await fetchDelegate(params?.address as string);

  if (!delegate) {
    return { revalidate: 30, props: { delegate: null } };
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
  const paths = delegates.map(d => `/delegates/${d.voteDelegateAddress}`);

  return {
    paths,
    fallback: true
  };
};
