/** @jsx jsx */
import { useState, useEffect } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import ErrorPage from 'next/error';
import useSWR from 'swr';
import { Card, Flex, Text, Heading, Divider, Link as ExternalLink, jsx } from 'theme-ui';
import { ethers } from 'ethers';

import OnChainFx from '../../components/executive/OnChainFx';
import Stack from '../../components/layouts/Stack';
import Tabs from '../../components/Tabs';
import PrimaryLayout from '../../components/layouts/Primary';
import SidebarLayout from '../../components/layouts/Sidebar';
import { getExecutiveProposal, getExecutiveProposals } from '../../lib/api';
import { getNetwork, isDefaultNetwork } from '../../lib/maker';
import { fetchJson, parseSpellStateDiff } from '../../lib/utils';
import Proposal from '../../types/proposal';
import invariant from 'tiny-invariant';
import Bignumber from 'bignumber.js';

type Props = {
  proposal: Proposal;
};

const ProposalView = ({ proposal }: Props) => {
  const { data: stateDiff } = useSWR(
    `/api/executive/state-diff/${proposal.address}?network=${getNetwork()}`,
    async url => parseSpellStateDiff(await fetchJson(url))
  );

  if ('content' in proposal) {
    return (
      <PrimaryLayout shortenFooter={true}>
        <SidebarLayout>
          <Card sx={{ boxShadow: 'faint' }}>
            <Flex>
              <Heading
                my="3"
                sx={{
                  whiteSpace: 'nowrap',
                  overflowX: ['scroll', 'hidden'],
                  overflowY: 'hidden',
                  textOverflow: [null, 'ellipsis'],
                  fontSize: [5, 6]
                }}
              >
                {proposal.title}
              </Heading>
            </Flex>
            <Divider />
            <Tabs
              tabTitles={['Proposal Details', 'On-Chain Effects']}
              tabPanels={[
                <div key={1} dangerouslySetInnerHTML={{ __html: proposal.content }} />,
                <div key={2} sx={{ pt: 3 }}>
                  <Text as="h1" sx={{ pb: 2 }}>
                    Effects
                  </Text>
                  {stateDiff ? (
                    <Stack gap={3}>
                      <Text>
                        {Object.keys(stateDiff.groupedDiff).length > 0 ? (
                          <>
                            {stateDiff.hasBeenCast
                              ? `Effects resulting from this spell's execution on block ${new Bignumber(
                                  stateDiff.executedOn
                                ).toFormat()}. `
                              : 'Simulated effects if this spell were to be executed now.'}
                            Please check the{' '}
                            <ExternalLink target="_blank" href="https://docs.makerdao.com">
                              MCD Docs
                            </ExternalLink>{' '}
                            for definitions.
                          </>
                        ) : (
                          'This spell has no on-chain effects.'
                        )}
                      </Text>
                      <OnChainFx stateDiff={stateDiff} />
                    </Stack>
                  ) : (
                    <div>loading</div>
                  )}
                </div>
              ]}
            />
          </Card>
          <Stack>
            <Card variant="compact">Card 1</Card>
            <Card variant="compact">Card 2</Card>
          </Stack>
        </SidebarLayout>
      </PrimaryLayout>
    );
  }

  return (
    <PrimaryLayout shortenFooter={true}>
      <SidebarLayout>
        <Card sx={{ boxShadow: 'faint' }}>
          <Flex>
            <Heading
              my="3"
              sx={{
                whiteSpace: 'nowrap',
                overflowX: ['scroll', 'hidden'],
                overflowY: 'hidden',
                textOverflow: [null, 'ellipsis'],
                fontSize: [5, 6]
              }}
            >
              {proposal.address}
            </Heading>
          </Flex>
          <Divider />
          <Tabs
            tabTitles={['On-Chain Effects']}
            tabPanels={[
              <div key={2} sx={{ pt: 3 }}>
                <Text as="h1" sx={{ pb: 2 }}>
                  Effects
                </Text>
                {stateDiff ? (
                  <Stack gap={3}>
                    <Text>
                      {Object.keys(stateDiff.groupedDiff).length > 0 ? (
                        <>
                          {stateDiff.hasBeenCast
                            ? `Effects resulting from this spell's execution on block ${new Bignumber(
                                stateDiff.executedOn
                              ).toFormat()}. `
                            : 'Simulated effects if this spell were to be executed now.'}
                          Please check the{' '}
                          <ExternalLink target="_blank" href="https://docs.makerdao.com">
                            MCD Docs
                          </ExternalLink>{' '}
                          for definitions.
                        </>
                      ) : (
                        'This spell has no on-chain effects.'
                      )}
                    </Text>
                    <OnChainFx stateDiff={stateDiff} />
                  </Stack>
                ) : (
                  <div>loading</div>
                )}
              </div>
            ]}
          />
        </Card>
        <Stack>
          <Card variant="compact">Card 1</Card>
          <Card variant="compact">Card 2</Card>
        </Stack>
      </SidebarLayout>
    </PrimaryLayout>
  );
};

// HOC to fetch the proposal depending on the network
export default function ProposalPage({ proposal: prefetchedProposal }: { proposal?: Proposal }) {
  const [_proposal, _setProposal] = useState<Proposal>();
  const [error, setError] = useState<string>();
  const { query, isFallback } = useRouter();

  // fetch proposal contents at run-time if on any network other than the default
  useEffect(() => {
    if (!isDefaultNetwork() && query['proposal-id']) {
      getExecutiveProposal(query['proposal-id'] as string)
        .then(_setProposal)
        .catch(setError);
    }
  }, [query['proposal-id']]);

  if (error || (isDefaultNetwork() && !isFallback && !prefetchedProposal?.key)) {
    return (
      <ErrorPage
        statusCode={404}
        title="Executive proposal either does not exist, or could not be fetched at this time"
      />
    );
  }

  if (isFallback || (!isDefaultNetwork() && !_proposal))
    return (
      <PrimaryLayout shortenFooter={true}>
        <p>Loading…</p>
      </PrimaryLayout>
    );

  const proposal = isDefaultNetwork() ? prefetchedProposal : _proposal;
  return <ProposalView proposal={proposal as Proposal} />;
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  // fetch proposal contents at build-time if on the default network
  invariant(params?.['proposal-id'], 'getStaticProps proposal id not found in params');
  const proposalId = params['proposal-id'] as string;

  const proposal: Proposal = ethers.utils.isAddress(proposalId)
    ? { address: proposalId, key: proposalId }
    : await getExecutiveProposal(proposalId);

  return {
    props: {
      proposal
    }
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const proposals = await getExecutiveProposals();
  const paths = proposals.map(proposal => `/executive/${proposal.key}`);

  return {
    paths,
    fallback: true
  };
};
