import { useState, useEffect } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import ErrorPage from 'next/error';
import Link from 'next/link';
import {
  Badge,
  Button,
  Card,
  Flex,
  Heading,
  Spinner,
  Box,
  Text,
  Divider,
  Link as ThemeUILink
} from 'theme-ui';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import useSWR from 'swr';
import { Icon } from '@makerdao/dai-ui-icons';
import { useBreakpointIndex } from '@theme-ui/match-media';
import invariant from 'tiny-invariant';
import { getExecutiveProposal, getExecutiveProposals } from 'modules/executive/api/fetchExecutives';
import { useSpellData } from 'modules/executive/hooks/useSpellData';
import { useVotedProposals } from 'modules/executive/hooks/useVotedProposals';
import { useHat } from 'modules/executive/hooks/useHat';
import { useMkrOnHat } from 'modules/executive/hooks/useMkrOnHat';
import { cutMiddle, limitString } from 'lib/string';
import { getStatusText } from 'modules/executive/helpers/getStatusText';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import { getEtherscanLink } from 'modules/web3/helpers/getEtherscanLink';
import { isDefaultNetwork } from 'modules/web3/helpers/networks';

//components
import VoteModal from 'modules/executive/components/VoteModal/index';
import Stack from 'modules/app/components/layout/layouts/Stack';
import Tabs from 'modules/app/components/Tabs';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import SidebarLayout from 'modules/app/components/layout/layouts/Sidebar';
import ResourceBox from 'modules/app/components/ResourceBox';
import { StatBox } from 'modules/app/components/StatBox';
import { SpellEffectsTab } from 'modules/executive/components/SpellEffectsTab';

//types
import { CMSProposal, Proposal, SpellData } from 'modules/executive/types';
import { HeadComponent } from 'modules/app/components/layout/Head';
import { CurrencyObject } from 'modules/app/types/currency';
import { Address } from 'modules/address/components/Address';
import { ZERO_ADDRESS } from 'modules/web3/constants/addresses';
import { useExecutiveComments } from 'modules/comments/hooks/useExecutiveComments';
import ExecutiveComments from 'modules/comments/components/ExecutiveComments';
import { useAccount } from 'modules/app/hooks/useAccount';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';

type Props = {
  proposal: Proposal;
};

const editMarkdown = content => {
  // hide the duplicate proposal title
  return content.replace(/^<h1>.*<\/h1>|^<h2>.*<\/h2>/, '');
};

const ProposalTimingBanner = ({
  proposal,
  spellData,
  mkrOnHat
}: {
  proposal: CMSProposal;
  spellData?: SpellData;
  mkrOnHat?: CurrencyObject;
}): JSX.Element => {
  if (spellData || proposal.address === ZERO_ADDRESS)
    return (
      <>
        <Divider my={1} />
        <Flex sx={{ py: 2, justifyContent: 'center', fontSize: [1, 2], color: 'onSecondary' }}>
          <Text sx={{ textAlign: 'center', px: [3, 4] }}>
            {getStatusText({ proposalAddress: proposal.address, spellData, mkrOnHat })}
          </Text>
        </Flex>
        <Divider sx={{ mt: 1 }} />
      </>
    );
  return <></>;
};

const ProposalView = ({ proposal }: Props): JSX.Element => {
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.POLL_DETAIL);
  const { data: spellData } = useSpellData(proposal.address);

  const { account } = useAccount();

  const bpi = useBreakpointIndex();
  const { network } = useActiveWeb3React();

  const { data: allSupporters, error: supportersError } = useSWR(
    `/api/executive/supporters?network=${network}`
  );

  const { data: votedProposals } = useVotedProposals();
  const { data: mkrOnHat } = useMkrOnHat();
  const { data: hat } = useHat();
  const isHat = hat && hat.toLowerCase() === proposal.address.toLowerCase();

  const { comments, error: commentsError } = useExecutiveComments(proposal.address, 60000);

  const supporters = allSupporters ? allSupporters[proposal.address.toLowerCase()] : null;

  const [voting, setVoting] = useState(false);
  const close = () => setVoting(false);

  const hasVotedFor =
    votedProposals &&
    !!votedProposals.find(
      proposalAddress => proposalAddress.toLowerCase() === proposal.address.toLowerCase()
    );

  return (
    <PrimaryLayout shortenFooter={true} sx={{ maxWidth: 'dashboard' }}>
      <HeadComponent
        title={`Proposal ${proposal['title'] ? proposal['title'] : proposal.address}`}
        description={`See the results of the MakerDAO executive proposal ${
          proposal['title'] ? proposal['title'] : proposal.address
        }.`}
      />

      {voting && <VoteModal close={close} proposal={proposal} />}
      {account && bpi === 0 && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            backgroundColor: 'surface',
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
          <Link href={{ pathname: '/executive' }}>
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
            {isHat && proposal.address !== ZERO_ADDRESS ? (
              <Badge
                variant="primary"
                sx={{
                  my: 2,
                  ml: [3, 4],
                  borderColor: 'primaryAlt',
                  color: 'primaryAlt',
                  textTransform: 'uppercase'
                }}
              >
                Governing proposal
              </Badge>
            ) : null}
            <Flex sx={{ mx: [3, 4], mb: 3, justifyContent: 'space-between' }}>
              <StatBox
                value={
                  <ThemeUILink
                    title="View on etherescan"
                    href={getEtherscanLink(network, proposal.address, 'address')}
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
                value={spellData && new BigNumber(spellData.mkrSupport).toFormat(3)}
                label="MKR Support"
              />
              <StatBox value={supporters && supporters.length} label="Supporters" />
            </Flex>
            {'about' in proposal ? (
              <Tabs
                tabListStyles={{ pl: [3, 4] }}
                tabTitles={[
                  'Proposal Detail',
                  'Spell Details',
                  `Comments ${comments ? `(${comments.length})` : ''}`
                ]}
                tabRoutes={['Proposal Detail', 'Spell Details', 'Comments']}
                tabPanels={[
                  <div
                    key={'about'}
                    sx={{ variant: 'markdown.default', p: [3, 4] }}
                    dangerouslySetInnerHTML={{ __html: editMarkdown(proposal.content) }}
                  />,
                  <div key={'spell'} sx={{ p: [3, 4] }}>
                    <SpellEffectsTab proposal={proposal} spellData={spellData} />
                  </div>,
                  <div key={'comments'} sx={{ p: [3, 4] }}>
                    {comments ? (
                      <ExecutiveComments proposal={proposal} comments={comments} />
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
                ]}
                banner={
                  <ProposalTimingBanner proposal={proposal} spellData={spellData} mkrOnHat={mkrOnHat} />
                }
              ></Tabs>
            ) : (
              <Tabs
                tabListStyles={{ pl: [3, 4] }}
                tabTitles={['Spell Details']}
                tabPanels={[
                  <div key={'spell'} sx={{ p: [3, 4] }}>
                    <SpellEffectsTab proposal={proposal} spellData={spellData} />
                  </div>
                ]}
              />
            )}
          </Card>
        </Box>
        <Stack gap={3} sx={{ mb: [5, 0] }}>
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
                {!allSupporters && !supportersError && (
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

                {supportersError && (
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
                )}
                {allSupporters && (!supporters || supporters.length === 0) && (
                  <Flex
                    sx={{
                      height: '100%',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <Text>Currently there are no supporters</Text>
                  </Flex>
                )}

                {supporters &&
                  supporters.length > 0 &&
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
                          {supporter.percent}% ({new BigNumber(supporter.deposits).toFormat(3)} MKR)
                        </Text>
                      </Box>

                      <Box sx={{ width: '45%', textAlign: 'right' }}>
                        <Link
                          href={{
                            pathname: `/address/${supporter.address}`
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
                                <Address address={supporter.address} />
                              </Text>
                            )}
                          </ThemeUILink>
                        </Link>
                      </Box>
                    </Flex>
                  ))}
              </Box>
            </Card>
          </Box>
          <ResourceBox type={'executive'} />
          <ResourceBox type={'general'} />
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
  const { network } = useActiveWeb3React();

  // fetch proposal contents at run-time if on any network other than the default
  useEffect(() => {
    if (!network) return;
    if (!isDefaultNetwork(network) && query['proposal-id']) {
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
  }, [query['proposal-id'], network]);

  if (error || (isDefaultNetwork(network) && !isFallback && !prefetchedProposal?.key)) {
    return (
      <ErrorPage
        statusCode={404}
        title="Executive proposal either does not exist, or could not be fetched at this time"
      />
    );
  }

  if (isFallback || (!isDefaultNetwork(network) && !_proposal))
    return (
      <PrimaryLayout shortenFooter={true}>
        <p>Loading…</p>
      </PrimaryLayout>
    );

  const proposal = isDefaultNetwork(network) ? prefetchedProposal : _proposal;
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
