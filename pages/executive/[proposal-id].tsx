/** @jsx jsx */
import { useState, useEffect } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import ErrorPage from 'next/error';
import useSWR from 'swr';
import { Card, Flex, Text, Heading, Divider, Grid, jsx } from 'theme-ui';

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
    `/api/executive/state-diff?network=${getNetwork()}&address=${proposal.source}`,
    async url => parseSpellStateDiff(await fetchJson(url))
  );

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
              <div dangerouslySetInnerHTML={{ __html: proposal.content }} />,
              <div sx={{ pt: 3 }}>
                <Text as="h1" sx={{ pb: 2 }}>
                  Effects
                </Text>
                {stateDiff ? (
                  <Stack gap={3}>
                    <Text>
                      {stateDiff.hasBeenCast
                        ? `Effects resulting from this spell's execution on block ${new Bignumber(
                            stateDiff.executedOn
                          ).toFormat()}`
                        : `Projected effects if this spell were to be executed now`}{' '}
                    </Text>
                    <Stack gap={3}>
                      {Object.entries(stateDiff.groupedDiff).map(([label, diffs]) => (
                        <div>
                          <Text as="h4">{label}</Text>
                          <Flex
                            sx={{
                              maxWidth: 'min-content',
                              overflowX: 'scroll'
                            }}
                          >
                            <Grid gap={0} pr={3} sx={{ fontSize: 3 }} columns="max-content">
                              {diffs.map(diff => (
                                <code>
                                  {diff.name}
                                  {diff.keys ? diff.keys.map(key => `[${key}]`) : ''}
                                  {diff.field ? `.${diff.field}` : ``}
                                </code>
                              ))}
                            </Grid>
                            <Grid
                              gap={0}
                              columns="repeat(3, fit-content(18ch))"
                              sx={{ columnGap: 3, fontSize: 3 }}
                            >
                              {diffs.map(diff => (
                                <>
                                  <code>
                                    {new Bignumber(diff.from).toFormat(
                                      diff.from.toString().split('.')?.[1]?.length || 0
                                    )}
                                  </code>
                                  <code>{'=>'}</code>
                                  <code>
                                    {new Bignumber(diff.to).toFormat(
                                      diff.to.toString().split('.')?.[1]?.length || 0
                                    )}
                                  </code>
                                </>
                              ))}
                            </Grid>
                          </Flex>
                        </div>
                      ))}
                    </Stack>
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
  const proposal = await getExecutiveProposal(params['proposal-id'] as string);

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
