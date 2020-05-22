import { useMemo, useEffect, useState } from 'react';
import Head from 'next/head';
import { Heading, Container, Text, Box } from 'theme-ui';
import useSWR from 'swr';

import { Global } from '@emotion/core';
import getMaker, { isDefaultNetwork } from '../lib/maker';
import { getPolls, getExecutiveProposals } from '../lib/api';
import PrimaryLayout from '../components/PrimaryLayout';
import SystemStats from '../components/SystemStats';
import PollCard from '../components/PollCard';
import ExecutiveCard from '../components/ExecutiveCard';

function Index({ proposals = [], polls = [] } = {}) {
  const recentPolls = useMemo(() => polls.slice(0, 4), []);

  const { data: hat } = useSWR(`/executive/hat`, () =>
    getMaker().then(maker => maker.service('chief').getHat())
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
          <Box py="6" mx="auto" sx={{ maxWidth: 9 }}>
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

        <Container as="section" pb="5" sx={{ maxWidth: 11 }}>
          <SystemStats />
        </Container>

        <Container
          pb="5"
          sx={{
            textAlign: 'center'
          }}
          as="section"
        >
          <Box mx="auto" sx={{ maxWidth: 9 }}>
            <Heading as="h2">Executive Votes</Heading>
            <Text
              mx="auto"
              mt="3"
              as="p"
              sx={{ fontSize: [3, 5], color: '#434358', lineHeight: 'body' }}
            >
              Executive Votes are conducted to make changes to the system. The
              governing proposal represents the current state of the system.
            </Text>
          </Box>
          <Box mx="auto" sx={{ textAlign: 'left', maxWidth: 10 }}>
            {proposals.map(proposal => (
              <ExecutiveCard
                isHat={
                  hat && hat.toLowerCase() === proposal.source.toLowerCase()
                }
                key={proposal.key}
                proposal={proposal}
              />
            ))}
          </Box>
        </Container>

        <Container
          as="section"
          sx={{
            textAlign: 'center'
          }}
        >
          <Box mx="auto" sx={{ maxWidth: 9 }}>
            <Heading as="h2">Polling Votes</Heading>
            <Text
              mx="auto"
              mt="3"
              as="p"
              sx={{ fontSize: [3, 5], color: '#434358', lineHeight: 'body' }}
            >
              Polls are conducted to establish a rough consensus of community
              sentiment before Executive Votes are conducted.
            </Text>
          </Box>
          <Box mx="auto" sx={{ textAlign: 'left', maxWidth: 10 }}>
            <Container py="4">
              {recentPolls.map(poll => (
                <PollCard key={poll.pollId} poll={poll} />
              ))}
            </Container>
          </Box>
        </Container>
      </Container>
    </PrimaryLayout>
  );
}

export default ({ proposals = [], polls = [] } = {}) => {
  // fetch polls & proposals at run-time if on any network other than the default
  const [_polls, _setPolls] = useState();
  const [_proposals, _setProposals] = useState();
  const [loading, setLoading] = useState(false);

  // fetch poll contents at run-time if on any network other than the default
  useEffect(() => {
    if (!isDefaultNetwork()) {
      setLoading(true);
      Promise.all([
        getPolls({ useCache: true }),
        getExecutiveProposals({ useCache: true })
      ]).then(([polls, proposals]) => {
        _setPolls(polls);
        _setProposals(proposals);
        setLoading(false);
      });
    }
  }, []);

  return (
    <Index
      loading={loading}
      proposals={isDefaultNetwork() ? proposals : _proposals}
      polls={isDefaultNetwork() ? polls : _polls}
    />
  );
};

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
