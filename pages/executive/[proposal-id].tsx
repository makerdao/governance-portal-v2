/** @jsx jsx */
import { useState, useEffect } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import ErrorPage from 'next/error';
import Link from 'next/link';
import { Button, Card, Flex, Heading, Spinner, Box, Text, Divider, Link as ThemeUILink, jsx } from 'theme-ui';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import useSWR from 'swr';
import { Icon } from '@makerdao/dai-ui-icons';
import { useBreakpointIndex } from '@theme-ui/match-media';
import invariant from 'tiny-invariant';
import { getExecutiveProposal, getExecutiveProposals } from 'modules/executive/api/fetchExecutives';
import { useSpellData } from 'lib/hooks';
import { useVotedProposals } from 'modules/executive/hooks/useVotedProposals';
import { getNetwork, isDefaultNetwork } from 'lib/maker';
import { cutMiddle, limitString } from 'lib/string';
import { getStatusText } from 'lib/executive/getStatusText';
import { useAnalytics } from 'lib/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'lib/client/analytics/analytics.constants';
import { getEtherscanLink } from 'lib/utils';

// stores
import useAccountsStore from 'stores/accounts';
import { ZERO_ADDRESS } from 'stores/accounts';

//components
import Comments from 'components/executive/Comments';
import VoteModal from 'components/executive/VoteModal';
import Stack from 'components/layouts/Stack';
import Tabs from 'components/Tabs';
import PrimaryLayout from 'components/layouts/Primary';
import SidebarLayout from 'components/layouts/Sidebar';
import ResourceBox from 'components/ResourceBox';
// import OnChainFx from 'components/executive/OnChainFx';
import { StatBox } from 'modules/shared/components/StatBox';

//types
import { CMSProposal, Proposal } from 'modules/executive/types';
import { SpellData } from 'types/spellData';
// import { SpellStateDiff } from 'types/spellStateDiff';

type Props = {
  proposal: Proposal;
};

const editMarkdown = content => {
  // hide the duplicate proposal title
  return content.replace(/^<h1>.*<\/h1>|^<h2>.*<\/h2>/, '');
};

const ProposalTimingBanner = ({
  proposal,
  spellData
}: {
  proposal: CMSProposal;
  spellData?: SpellData;
}): JSX.Element => {
  if (spellData || proposal.address === ZERO_ADDRESS)
    return (
      <>
        <Divider my={1} />
        <Flex sx={{ py: 2, justifyContent: 'center', fontSize: [1, 2], color: 'onSecondary' }}>
          <Text sx={{ textAlign: 'center', px: [3, 4] }}>{getStatusText(proposal.address, spellData)}</Text>
        </Flex>
        <Divider sx={{ mt: 1 }} />
      </>
    );
  return <></>;
};

const ProposalView = ({ proposal }: Props): JSX.Element => {
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.POLL_DETAIL);
  const { data: spellData } = useSpellData(proposal.address);

  const network = getNetwork();
  const account = useAccountsStore(state => state.currentAccount);
  const bpi = useBreakpointIndex();

  // ch401: hide until API is fixed
  // const [stateDiff, setStateDiff] = useState<SpellStateDiff>();
  // const [stateDiffError, setStateDiffError] = useState();

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const url = `/api/executive/state-diff/${proposal.address}?network=${getNetwork()}`;
  //       const _stateDiff = parseSpellStateDiff(await fetchJson(url));
  //       setStateDiff(_stateDiff);
  //     } catch (error) {
  //       setStateDiffError(error);
  //     }
  //   })();
  // }, []);

  const { data: allSupporters, error: supportersError } = useSWR(
    `/api/executive/supporters?network=${getNetwork()}`
  );

  const { data: votedProposals } = useVotedProposals();

  const { data: comments, error: commentsError } = useSWR(
    `/api/executive/comments/list/${proposal.address}`,
    { refreshInterval: 60000 }
  );

  const supporters = allSupporters ? allSupporters[proposal.address.toLowerCase()] : null;

  const [voting, setVoting] = useState(false);
  const close = () => setVoting(false);

  const commentsTab = (
    <div key={2} sx={{ p: [3, 4] }}>
      {comments ? (
        <Comments proposal={proposal} comments={comments} />
      ) : (
        <Flex sx={{ alignItems: 'center' }}>
          {commentsError ? (
            'Unable to fetch comments'
          ) : (
            <>
              Loading <Spinner size={20} ml={2} />
            </>
          )}
        </Flex>
      )}
    </div>
  );

  // ch401: hide until API is fixed
  // const onChainFxTab = (
  //   <div key={3} sx={{ p: [3, 4] }}>
  //     <Flex sx={{ mb: 3, overflow: 'auto' }}>
  //       For the spell at address
  //       <ThemeUILink href={getEtherscanLink(getNetwork(), proposal.address, 'address')} target="_blank">
  //         <Text sx={{ ml: 2, color: 'accentBlue', ':hover': { color: 'blueLinkHover' } }}>
  //           {proposal.address}
  //         </Text>
  //       </ThemeUILink>
  //     </Flex>
  //     {stateDiff ? (
  //       <OnChainFx stateDiff={stateDiff} />
  //     ) : stateDiffError ? (
  //       <Flex>Unable to fetch on-chain effects at this time</Flex>
  //     ) : (
  //       <Flex sx={{ alignItems: 'center' }}>
  //         loading <Spinner size={20} ml={2} />
  //       </Flex>
  //     )}
  //   </div>
  // );

  const hasVotedFor =
    votedProposals &&
    !!votedProposals.find(
      proposalAddress => proposalAddress.toLowerCase() === proposal.address.toLowerCase()
    );

  return (
    <PrimaryLayout shortenFooter={true} sx={{ maxWidth: 'dashboard' }}>
      {voting && <VoteModal close={close} proposal={proposal} currentSlate={votedProposals} />}
      {account && bpi === 0 && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            backgroundColor: 'white',
            width: '100vw',
            borderTopLeftRadius: 'roundish',
            borderTopRightRadius: 'roundish',
            px: 3,
            py: 4,
            border: '1px solid #D4D9E1'
          }}
        >
          <Button
            variant="primaryLarge"
            onClick={() => {
              trackButtonClick('openPollVoteModal');
              setVoting(true);
            }}
            sx={{ width: '100%' }}
            disabled={hasVotedFor && votedProposals && votedProposals.length === 1}
          >
            Vote for this proposal
          </Button>
        </Box>
      )}
      <SidebarLayout>
        <Box>
          <Link href={{ pathname: '/executive', query: { network } }}>
            <Button variant="mutedOutline" mb={2}>
              <Flex sx={{ alignItems: 'center', whiteSpace: 'nowrap' }}>
                <Icon name="chevron_left" size="2" mr={2} />
                Back to {bpi === 0 ? 'all' : 'executive'} proposals
              </Flex>
            </Button>
          </Link>
          <Card sx={{ p: [0, 0] }}>
            <Heading pt={[3, 4]} px={[3, 4]} pb="3" sx={{ fontSize: [5, 6] }}>
              {'title' in proposal ? proposal.title : proposal.address}
            </Heading>
            <Flex sx={{ mx: [3, 4], mb: 3, justifyContent: 'space-between' }}>
              <StatBox
                value={
                  <ThemeUILink
                    title="View on etherescan"
                    href={getEtherscanLink(getNetwork(), proposal.address, 'address')}
                    target="_blank"
                  >
                    <Text as="p" sx={{ fontSize: [2, 5] }}>
                      {cutMiddle(proposal.address, bpi > 0 ? 6 : 4, bpi > 0 ? 6 : 4)}
                    </Text>
                  </ThemeUILink>
                }
                label="Spell Address"
              />
              <StatBox
                value={spellData && new BigNumber(spellData.mkrSupport).toFormat(2)}
                label="MKR Support"
              />
              <StatBox value={supporters && supporters.length} label="Supporters" />
            </Flex>
            {
              'about' in proposal ? (
                <Tabs
                  tabListStyles={{ pl: [3, 4] }}
                  tabTitles={[
                    'Proposal Detail',
                    // ch401: hide until API is fixed
                    // 'On-Chain Effects',
                    `Comments ${comments ? `(${comments.length})` : ''}`
                  ]}
                  tabPanels={[
                    <div
                      key={1}
                      sx={{ variant: 'markdown.default', p: [3, 4] }}
                      dangerouslySetInnerHTML={{ __html: editMarkdown(proposal.content) }}
                    />,
                    // onChainFxTab,
                    commentsTab
                  ]}
                  banner={<ProposalTimingBanner proposal={proposal} spellData={spellData} />}
                ></Tabs>
              ) : null
              // ch401: hide until API is fixed
              // (
              // <Tabs
              //   tabListStyles={{ pl: [3, 4] }}
              //   tabTitles={['On-Chain Effects']}
              //   tabPanels={[onChainFxTab]}
              // />
              // )
            }
          </Card>
        </Box>
        <Stack gap={3}>
          {account && bpi !== 0 && (
            <>
              <Heading my={2} mb={'14px'} as="h3" variant="microHeading">
                Your Vote
              </Heading>
              <Card variant="compact">
                <Text sx={{ fontSize: 5 }}>
                  {'title' in proposal ? proposal.title : cutMiddle(proposal.address)}
                </Text>
                <Button
                  variant="primaryLarge"
                  onClick={() => {
                    trackButtonClick('openPollVoteModal');
                    setVoting(true);
                  }}
                  sx={{ width: '100%', mt: 3 }}
                  disabled={hasVotedFor && votedProposals && votedProposals.length === 1}
                >
                  Vote for this proposal
                </Button>
              </Card>
            </>
          )}
          <Box>
            <Heading mt={3} mb={2} as="h3" variant="microHeading">
              Supporters
            </Heading>
            {spellData && (
              <Text mt={3} mb={2} as="p" variant="body2">
                {new BigNumber(spellData.mkrSupport).toFormat(2)} total MKR supporting
              </Text>
            )}
            <Card variant="compact" p={3} sx={{ height: '237px' }}>
              <Box
                sx={{
                  overflowY: 'scroll',
                  height: '100%',
                  '::-webkit-scrollbar': {
                    display: 'none'
                  },
                  scrollbarWidth: 'none'
                }}
              >
                {supporters ? (
                  supporters.map(supporter => (
                    <Flex
                      sx={{
                        justifyContent: 'space-between',
                        fontSize: [2, 3],
                        lineHeight: '34px'
                      }}
                      key={supporter.address}
                    >
                      <Box sx={{ width: '55%' }}>
                        <Text color="onSecondary">
                          {supporter.percent}% ({new BigNumber(supporter.deposits).toFormat(2)} MKR)
                        </Text>
                      </Box>

                      <Box sx={{ width: '45%', textAlign: 'right' }}>
                        <Link
                          href={{
                            pathname: `/address/${supporter.address}`,
                            query: { network }
                          }}
                          passHref
                        >
                          <ThemeUILink sx={{ mt: 'auto' }} title="Profile details">
                            {supporter.name ? (
                              <Text
                                sx={{
                                  color: 'accentBlue',
                                  fontSize: 3,
                                  ':hover': { color: 'blueLinkHover' }
                                }}
                              >
                                {limitString(supporter.name, bpi === 0 ? 14 : 22, '...')}
                              </Text>
                            ) : (
                              <Text
                                sx={{
                                  color: 'accentBlue',
                                  fontSize: 3,
                                  ':hover': { color: 'blueLinkHover' }
                                }}
                              >
                                {cutMiddle(supporter.address)}
                              </Text>
                            )}
                          </ThemeUILink>
                        </Link>
                      </Box>
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
                    List of supporters currently unavailable
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
        .then(proposal => {
          if (proposal) {
            _setProposal(proposal);
          } else {
            setError('No proposal found');
          }
        })
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

  const proposal: Proposal | null = ethers.utils.isAddress(proposalId)
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
