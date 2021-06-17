import { useEffect, useState, useRef, useMemo } from 'react';
import { Heading, Box, Flex, jsx, Button, Text } from 'theme-ui';

import { GetStaticProps } from 'next';

import { isDefaultNetwork } from '../../lib/maker';

import PrimaryLayout from '../../components/layouts/Primary';
import SidebarLayout from '../../components/layouts/Sidebar';
import Stack from '../../components/layouts/Stack';

import Head from 'next/head';

type Props = {
  delegates: any[];
};

const Delegates = ({ delegates }: Props) => {
  
  return (
    <PrimaryLayout  sx={{ maxWidth: [null, null, null, 'page', 'dashboard'] }}>
      <Head>
        <title>Maker Governance - Delegates</title>
      </Head>
      
      <Stack gap={3}>
        
        <Flex sx={{ alignItems: 'center' }}>
          <Heading variant="microHeading" mr={3}>
            Filters
          </Heading>
          TBD
        </Flex>

        <SidebarLayout>
          <Box>
            HEY
          </Box>
         
        </SidebarLayout>
      </Stack>
    </PrimaryLayout>
  );
};

export default function DelegatesPage({ delegates }: Props): JSX.Element {
 
  useEffect(() => {
    if (!isDefaultNetwork()) {
      
    }
  }, []);


  if (!isDefaultNetwork()) {
    return (
      <PrimaryLayout>
        <p>Loading…</p>
      </PrimaryLayout>
    );
  }

  return <Delegates delegates={delegates} />;
}

export const getStaticProps: GetStaticProps = async () => {
  const delegates = [];

  return {
    revalidate: 30, // allow revalidation every 30 seconds
    props: {
      delegates
    }
  };
};
