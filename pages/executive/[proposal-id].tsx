/** @jsx jsx */
import { useState, useEffect } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import ErrorPage from 'next/error';
import useSWR from 'swr';
import { Button, Card, Flex, Heading, Spinner, Box, Text, Link as ExternalLink, jsx } from 'theme-ui';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import Link from 'next/link';
import { Icon } from '@makerdao/dai-ui-icons';

import OnChainFx from '../../components/executive/OnChainFx';
import VoteModal from '../../components/executive/VoteModal';
import Stack from '../../components/layouts/Stack';
import Tabs from '../../components/Tabs';
import PrimaryLayout from '../../components/layouts/Primary';
import SidebarLayout from '../../components/layouts/Sidebar';
import ResourceBox from '../../components/ResourceBox';
import { getExecutiveProposal, getExecutiveProposals } from '../../lib/api';
import getMaker, { getNetwork, isDefaultNetwork } from '../../lib/maker';
import { fetchJson, parseSpellStateDiff, getEtherscanLink, cutMiddle } from '../../lib/utils';
import Proposal from '../../types/proposal';
import invariant from 'tiny-invariant';
import useAccountsStore from '../../stores/accounts';

type Props = {
  proposal: Proposal;
};

const editMarkdown = content => {
  // hide the duplicate proposal title
  return content.replace(/^<h1>.*<\/h1>/, '');
};

const ProposalView = ({ proposal }: Props): JSX.Element => {
  const network = getNetwork();
  const account = useAccountsStore(state => state.currentAccount);

  const { data: stateDiff } = useSWR(
    `/api/executive/state-diff/${proposal.address}?network=${getNetwork()}`,
    async url => parseSpellStateDiff(await fetchJson(url))
  );

  const { data: allSupporters, error: supportersError } = useSWR('/exec-supporters', async () => {
    const maker = await getMaker();
    return maker.service('chief').getVoteTally();
  });
  const supporters = allSupporters ? allSupporters[proposal.address.toLowerCase()] : null;

  const [voting, setVoting] = useState(false);
  const close = () => setVoting(false);

  const onChainFxTab = (
    <div key={2} sx={{ p: [3, 4] }}>
      {stateDiff ? (
        <OnChainFx stateDiff={stateDiff} />
      ) : (
        <Flex sx={{ alignItems: 'center' }}>
          loading <Spinner size={20} ml={2} />
        </Flex>
      )}
    </div>
  );

  return (
    <PrimaryLayout shortenFooter={true}>
      {voting && <VoteModal close={close} proposal={proposal} />}
      <SidebarLayout>
        <Box>
          <Link href={{ pathname: '/executive', query: { network } }}>
            <Button variant="mutedOutline" mb={2}>
              <Flex sx={{ display: ['none', 'block'], alignItems: 'center', whiteSpace: 'nowrap' }}>
                <Icon name="chevron_left" size="2" mr={2} />
                Back to executive proposals
              </Flex>
            </Button>
          </Link>
          <Card sx={{ p: [0, 0] }}>
            <Heading pt={[3, 4]} px={[3, 4]} pb="3" sx={{ fontSize: [5, 6] }}>
              {'title' in proposal ? proposal.title : proposal.address}
            </Heading>
            {'about' in proposal ? (
              <Tabs
                tabListStyles={{ pl: [3, 4] }}
                tabTitles={['Proposal Detail', 'On-Chain Effects']}
                tabPanels={[
                  <div
                    key={1}
                    sx={{ variant: 'markdown.default', p: [3, 4] }}
                    dangerouslySetInnerHTML={{ __html: editMarkdown(proposal.content) }}
                  />,
                  onChainFxTab
                ]}
              />
            ) : (
              <Tabs tabTitles={['On-Chain Effects']} tabPanels={[onChainFxTab]} />
            )}
          </Card>
        </Box>
        <Stack gap={3}>
          {account && (
            <Card variant="compact">
              {proposal.address}
              <Button variant="primary" onClick={() => setVoting(true)}>
                Vote
              </Button>
            </Card>
          )}
          <Box>
            <Heading mt={3} mb={2} as="h3" variant="microHeading">
              Supporters
            </Heading>
            <Card variant="compact" p={3} sx={{ height: '237px' }}>
              <Box sx={{ overflowY: 'scroll', height: '100%' }}>
                {supporters ? (
                  supporters.map(supporter => (
                    <Flex
                      sx={{
                        justifyContent: 'space-between',
                        fontSize: 3,
                        lineHeight: '34px'
                      }}
                      key={supporter.address}
                    >
                      <Text color="onSecondary">
                        {supporter.percent}% ({new BigNumber(supporter.deposits).toFormat(2)} MKR)
                      </Text>
                      <ExternalLink
                        href={getEtherscanLink(getNetwork(), supporter.address, 'address')}
                        target="_blank"
                      >
                        <Text sx={{ color: 'accentBlue', fontSize: 3, ':hover': { color: 'blueLinkHover' } }}>
                          {cutMiddle(supporter.address)}
                        </Text>
                      </ExternalLink>
                    </Flex>
                  ))
                ) : supportersError ? (
                  <Flex
                    sx={{
                      height: '100%',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontSize: 4,
                      color: 'onSecondary'
                    }}
                  >
                    No supporters found
                  </Flex>
                ) : (
                  <Flex
                    sx={{
                      height: '100%',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <Spinner size={32} />
                  </Flex>
                )}
              </Box>
            </Card>
          </Box>
          <ResourceBox />
        </Stack>
      </SidebarLayout>
    </PrimaryLayout>
  );
};

// HOC to fetch the proposal depending on the network
export default function ProposalPage({ proposal: prefetchedProposal }: { proposal?: Proposal }): JSX.Element {
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
