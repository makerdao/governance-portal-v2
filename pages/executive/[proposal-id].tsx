/** @jsx jsx */
import { useState, useEffect } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import ErrorPage from 'next/error';
import useSWR from 'swr';
import { Box, Button, Card, Flex, Text, Heading, Divider, Spinner, Link as ExternalLink, jsx } from 'theme-ui';
import { ethers } from 'ethers';

import OnChainFx from '../../components/executive/OnChainFx';
import VoteModal from '../../components/executive/VoteModal';
import Stack from '../../components/layouts/Stack';
import Tabs from '../../components/Tabs';
import PrimaryLayout from '../../components/layouts/Primary';
import SidebarLayout from '../../components/layouts/Sidebar';
import ResourceBox from '../../components/ResourceBox';
import useAccountsStore from '../../stores/accounts';
import { getExecutiveProposal, getExecutiveProposals } from '../../lib/api';
import getMaker, { getNetwork, isDefaultNetwork } from '../../lib/maker';
import { fetchJson, parseSpellStateDiff } from '../../lib/utils';
import Proposal from '../../types/proposal';
import invariant from 'tiny-invariant';
import Bignumber from 'bignumber.js';

type Props = {
  proposal: Proposal;
};

const ProposalView = ({ proposal }: Props) => {
  const account = useAccountsStore(state => state.currentAccount)
  const { data: stateDiff } = useSWR(
    `/api/executive/state-diff/${proposal.address}?network=${getNetwork()}`,
    async url => parseSpellStateDiff(await fetchJson(url))
  );
  const { data: lockedMkr } = useSWR(
    account?.address ? ['/api/executive/', account.address] : null,
    (_, address) => getMaker().then(maker => maker.service('chief').getNumDeposits(address))
  );
  const [showDialog, setShowDialog] = useState(false);
  const open = () => setShowDialog(true);
  const close = () => setShowDialog(false);



  if ('about' in proposal) {
    return (
      <PrimaryLayout shortenFooter={true}>
        <SidebarLayout>
          <VoteModal
            proposal={proposal}
            showDialog={showDialog}
            close={close}
            lockedMkr={lockedMkr}
          />
          <Card sx={{ boxShadow: 'faint' }}>
            <Flex>
              <Heading
                my='3'
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
              tabTitles={['Proposal Detail', 'On-Chain Effects']}
              tabPanels={[
                <div key={1} dangerouslySetInnerHTML={{ __html: proposal.content }} />,
                <div key={2} sx={{ pt: 3 }}>
                  <Text as='h1' sx={{ pb: 2 }}>
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
                            <ExternalLink target='_blank' href='https://docs.makerdao.com'>
                              MCD Docs
                            </ExternalLink>{' '}
                            for definitions. NOTE:{' '}
                            <strong>
                              on-chain effects is temporarily only checking the VAT for changes. The rest of
                              the MCD contracts will be added in soon.
                            </strong>
                          </>
                        ) : (
                          'This spell has no on-chain effects.'
                        )}
                      </Text>
                      <OnChainFx stateDiff={stateDiff} />
                    </Stack>
                  ) : (
                    <Flex sx={{ alignItems: 'center' }}>
                      loading <Spinner size={20} ml={2} />
                    </Flex>
                  )}
                </div>
              ]}
            />
          </Card>
          <Stack>
            <Box>
              <Text sx={{fontSize: '20px'}}>Your Vote</Text>
              <Card variant='compact' sx={{mt: 2}}>
                <Text sx={{fontSize: '20px', color:'onBackgroundAlt', fontWeight: 'medium'}}>{proposal.title}</Text>
                <Button variant='primary' onClick={open} sx={{width: '100%', mt: 3}}>
                  Vote for this proposal
                </Button>
              </Card>
            </Box>
            
            <Card variant='compact'>Supporters</Card>
            <ResourceBox />
          </Stack>
        </SidebarLayout>
      </PrimaryLayout>
    );
  }

  return (
    <PrimaryLayout shortenFooter={true}>
      <SidebarLayout>
        <VoteModal proposal={proposal} showDialog={showDialog} close={close} lockedMkr={lockedMkr} />
        <Card sx={{ boxShadow: 'faint' }}>
          <Flex>
            <Heading
              my='3'
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
                <Text as='h1' sx={{ pb: 2 }}>
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
                          <ExternalLink target='_blank' href='https://docs.makerdao.com'>
                            MCD Docs
                          </ExternalLink>{' '}
                          for definitions. NOTE:{' '}
                          <strong>
                            on-chain effects is temporarily only checking the VAT for changes. The rest of the
                            MCD contracts will be added in soon.
                          </strong>
                        </>
                      ) : (
                        'This spell has no on-chain effects.'
                      )}
                    </Text>
                    <OnChainFx stateDiff={stateDiff} />
                  </Stack>
                ) : (
                  <Flex sx={{ alignItems: 'center' }}>
                    loading <Spinner size={20} ml={2} />
                  </Flex>
                )}
              </div>
            ]}
          />
        </Card>
        <Stack>
          <Card variant='compact'>
            {proposal.address}
            <Button variant='primary' onClick={open}>
              Vote
            </Button>
          </Card>
          <Card variant='compact'>Supporters</Card>
          <ResourceBox />
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
        title='Executive proposal either does not exist, or could not be fetched at this time'
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
