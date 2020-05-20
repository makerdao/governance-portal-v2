import { useMemo } from 'react';
import Head from 'next/head';
<<<<<<< HEAD
import {
  Heading,
  Card,
  NavLink,
  Container,
  Text,
  Box,
  Flex,
  Badge,
  Button,
} from 'theme-ui';
=======
import { Heading, NavLink, Container, Text, Box } from 'theme-ui';
>>>>>>> master
import useSWR from 'swr';
import Link from 'next/link';
import { Icon } from "@makerdao/dai-ui-icons";

import { Global } from '@emotion/core';
import { getNetwork, isDefaultNetwork } from '../lib/maker';
import { getPolls, getExecutiveProposals } from '../lib/api';
import PrimaryLayout from '../components/PrimaryLayout';
import SystemStats from '../components/SystemStats';
<<<<<<< HEAD
import Executive from '../components/Executive';
import Polling from '../components/Polling';
=======
import PollCard from '../components/PollCard';
>>>>>>> master

export default ({ proposals = [], polls = [] } = {}) => {
  // fetch polls & proposals at run-time if on any network other than the default
  const { data: _polls } = useSWR(
    isDefaultNetwork() ? null : `/polling/polls`,
    getPolls,
    { refreshInterval: 0 }
  );

  const { data: _proposals } = useSWR(
    isDefaultNetwork() ? null : `/executive/proposals`,
    getExecutiveProposals,
    { refreshInterval: 0 }
  );

  return (
    <Index
      proposals={isDefaultNetwork() ? proposals : _proposals}
      polls={isDefaultNetwork() ? polls : _polls}
    />
  );
};

function Index({ proposals = [], polls = [] } = {}) {
  const network = getNetwork();

  const activePolls = useMemo(
    () =>
      polls.filter(
        poll =>
          new Date(poll.startDate) <= new Date() &&
          new Date(poll.endDate) >= new Date()
      ),
    []
  );

  return (
    <PrimaryLayout>
      <Global
        styles={theme => ({
          html: {
            backgroundRepeat: 'no-repeat',
            backgroundImage: `linear-gradient(${theme.colors.surface}, ${theme.colors.surface}),
            linear-gradient(${theme.colors.background}, ${theme.colors.background})`,
            backgroundSize: `100% 560px, 100% 100%`
          },
          body: {
            backgroundRepeat: 'inherit',
            backgroundImage: 'inherit',
            backgroundSize: 'inherit'
          }
        })}
      />

      <Head>
        <title>Maker Governance Portal</title>
      </Head>
      <Container>
        <Container
          as="section"
          sx={{
            textAlign: 'center'
          }}
        >
          <Box pt="6" mx="auto" sx={{ maxWidth: 9 }}>
            <Heading as="h1" sx={{ fontSize: [7, 8], color: '#231536' }}>
              Maker Governance
            </Heading>
            <Text
              mx="auto"
              mt="3"
              as="p"
              sx={{
                fontSize: [3, 5],
                color: '#434358',
                lineHeight: 'body'
              }}
            >
              Join a decentralized community protecting the integrity of the
              Maker Protocol through research, discussion, and on-chain voting.
            </Text>
          </Box>
        </Container>
        <Box py="5" mx="auto" sx={{ maxWidth: 9, textAlign: 'center' }}>
          <Button
            variant='outline'
            sx={{
              borderRadius: 'round',
              bg: 'background',
              border: '1px solid',
              borderColor: 'secondary',
              color: '#434358',
              alignItems: 'center'
            }}
          >
            <span style={{
              display: 'inline-block',
              border: '1px solid #1AAB9B',
              borderRadius: 13,
              width: 26, height: 26, color: '#1AAB9B', marginRight: 20}}>
              {activePolls.length}
            </span>
            New polling votes!
            <Icon name="chevron_right" color="#708390" size="2" sx={{ marginLeft: 20 }}/>
          </Button>
        </Box>
        <Container as="section" pb="5" sx={{ maxWidth: 11 }}>
          <SystemStats />
        </Container>
        <Executive proposals={proposals} network={network} />
        <Polling activePolls={activePolls} network={network} />
      </Container>
    </PrimaryLayout>
  );
}
export async function getStaticProps() {
  // fetch polls & proposals at build-time if on the default network
  const [proposals, polls] = await Promise.all([
    getExecutiveProposals(),
    getPolls()
  ]);

  return {
    unstable_revalidate: 30, // allow revalidation every 30 seconds
    props: {
      proposals,
      polls
    }
  };
}
