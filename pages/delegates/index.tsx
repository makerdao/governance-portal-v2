/** @jsx jsx */
import { Heading, Box, jsx, Flex } from 'theme-ui';

import { GetStaticProps } from 'next';

import { isDefaultNetwork } from '../../lib/maker';

import PrimaryLayout from '../../components/layouts/Primary';
import SidebarLayout from '../../components/layouts/Sidebar';
import Stack from '../../components/layouts/Stack';
import SystemStatsSidebar from '../../components/SystemStatsSidebar';
import ResourceBox from '../../components/ResourceBox';

import Head from 'next/head';
import { Delegate } from 'types/delegate';
import DelegateCard from '../../components/delegations/DelegateCard';
import { fetchDelegates } from '../../lib/delegates/fetchDelegates';

type Props = {
  delegates: Delegate[];
};

const Delegates = ({ delegates }: Props) => {
  return (
    <PrimaryLayout shortenFooter={true} sx={{ maxWidth: [null, null, null, 'page', 'dashboard'] }}>
      <Head>
        <title>Maker Governance - Delegates</title>
      </Head>

      <SidebarLayout>
        <Box>
          <Flex sx={{ alignItems: 'center' }}>
            <Heading variant="microHeading" mr={3}>
              Filters
            </Heading>
            TBD
          </Flex>

          <Heading mb={3} mt={4} as="h4">
            Recognized delegates
          </Heading>

          <Box>
            {delegates.map(delegate => (
              <Box key={delegate.id} sx={{ mb: 4 }}>
                <DelegateCard delegate={delegate} />
              </Box>
            ))}
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

export default function DelegatesPage({ delegates }: Props): JSX.Element {
  // if (!isDefaultNetwork()) {
  //   return (
  //     <PrimaryLayout>
  //       <p>Loading…</p>
  //     </PrimaryLayout>
  //   );
  // }

  return <Delegates delegates={delegates} />;
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
