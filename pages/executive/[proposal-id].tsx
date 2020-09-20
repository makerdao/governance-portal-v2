/** @jsx jsx */
import { useState, useEffect } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import ErrorPage from 'next/error';
import useSWR from 'swr';
import {
  Button,
  Card,
  Flex,
  Heading,
  Spinner,
  jsx
} from 'theme-ui';
import { ethers } from 'ethers';

import OnChainFx from '../../components/executive/OnChainFx';
import VoteModal from '../../components/executive/VoteModal';
import Stack from '../../components/layouts/Stack';
import Tabs from '../../components/Tabs';
import PrimaryLayout from '../../components/layouts/Primary';
import SidebarLayout from '../../components/layouts/Sidebar';
import ResourceBox from '../../components/ResourceBox';
import { getExecutiveProposal, getExecutiveProposals } from '../../lib/api';
import { getNetwork, isDefaultNetwork } from '../../lib/maker';
import { fetchJson, parseSpellStateDiff } from '../../lib/utils';
import Proposal from '../../types/proposal';
import invariant from 'tiny-invariant';

type Props = {
  proposal: Proposal;
};

const editMarkdown = content => {
  // hide the duplicate proposal title
  return content.replace(/^<h1>.*<\/h1>/, '');
};

const ProposalView = ({ proposal }: Props) => {
  const { data: stateDiff } = useSWR(
    `/api/executive/state-diff/${proposal.address}?network=${getNetwork()}`,
    async url => parseSpellStateDiff(await fetchJson(url))
  );
  const [showDialog, setShowDialog] = useState(false);
  const open = () => setShowDialog(true);
  const close = () => setShowDialog(false);

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
      <SidebarLayout>
        <VoteModal showDialog={showDialog} close={close} proposal={proposal} />
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
        <Stack>
          <Card variant="compact">
            {proposal.address}
            <Button variant="primary" onClick={open}>
              Vote
            </Button>
          </Card>
          <Card variant="compact">Supporters</Card>
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
