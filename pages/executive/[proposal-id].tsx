import { useState, useEffect } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
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
import { BigNumber as BigNumberJS } from 'bignumber.js';
import useSWR, { useSWRConfig } from 'swr';
import { Icon } from '@makerdao/dai-ui-icons';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { getExecutiveProposal, getGithubExecutives } from 'modules/executive/api/fetchExecutives';
import { useSpellData } from 'modules/executive/hooks/useSpellData';
import { useVotedProposals } from 'modules/executive/hooks/useVotedProposals';
import { useHat } from 'modules/executive/hooks/useHat';
import { useMkrOnHat } from 'modules/executive/hooks/useMkrOnHat';
import { cutMiddle, formatValue } from 'lib/string';
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
import { CMSProposal, Proposal, SpellData, SpellDiff } from 'modules/executive/types';
import { HeadComponent } from 'modules/app/components/layout/Head';
import { BigNumber } from 'ethers';
import { ZERO_ADDRESS } from 'modules/web3/constants/addresses';
import { useExecutiveComments } from 'modules/comments/hooks/useExecutiveComments';
import ExecutiveComments from 'modules/comments/components/ExecutiveComments';
import { useAccount } from 'modules/app/hooks/useAccount';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { ErrorBoundary } from 'modules/app/components/ErrorBoundary';
import AddressIconBox from 'modules/address/components/AddressIconBox';
import { DEFAULT_NETWORK } from 'modules/web3/constants/networks';
import { fetchJson } from 'lib/fetchJson';
import { fetchHistoricalSpellDiff } from 'modules/executive/api/fetchHistoricalSpellDiff';
import { isAfter, sub } from 'date-fns';

type Props = {
  proposal: Proposal;
  spellDiffs: SpellDiff[];
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
  mkrOnHat?: BigNumber;
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

const ProposalView = ({ proposal, spellDiffs }: Props): JSX.Element => {
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.POLL_DETAIL);
  const { data: spellData } = useSpellData(proposal.address);

  const { account } = useAccount();

  const bpi = useBreakpointIndex();
  const { network } = useActiveWeb3React();
  const { cache } = useSWRConfig();

  const dataKey = `/api/executive/supporters?network=${network}`;
  const { data: allSupporters, error: supportersError } = useSWR(dataKey, fetchJson, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnMount: !cache.get(dataKey),
    revalidateOnReconnect: false
  });

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
            border: '1px solid #D4D9E1',
            zIndex: 10
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
              {proposal.title ? proposal.title : proposal.address}
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
                    <Text sx={{ fontSize: [2, 5] }}>
                      {cutMiddle(proposal.address, bpi > 0 ? 6 : 4, bpi > 0 ? 6 : 4)}
                    </Text>
                  </ThemeUILink>
                }
                label="Spell Address"
              />
              <StatBox
                value={spellData && spellData.mkrSupport && formatValue(BigNumber.from(spellData.mkrSupport))}
                label="MKR Support"
              />
              <StatBox
                value={
                  allSupporters && (!supporters || supporters.length === 0)
                    ? '0'
                    : supporters && supporters.length
                }
                label="Supporters"
              />
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
                    <SpellEffectsTab proposal={proposal} spellData={spellData} spellDiffs={spellDiffs} />
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
                  <ErrorBoundary componentName="Executive Timing Banner">
                    <ProposalTimingBanner proposal={proposal} spellData={spellData} mkrOnHat={mkrOnHat} />
                  </ErrorBoundary>
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
            <Box>
              <Heading my={2} mb={'14px'} as="h3" variant="microHeading">
                Your Vote
              </Heading>
              <Card variant="compact">
                <Text sx={{ fontSize: 5 }}>
                  {proposal.title ? proposal.title : cutMiddle(proposal.address)}
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
            </Box>
          )}
          <Box>
            <Heading mt={3} mb={2} as="h3" variant="microHeading">
              Supporters
            </Heading>
            <ErrorBoundary componentName="Executive Supporters">
              <Card variant="compact" p={3}>
                <Box>
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
                          ':not(:last-child)': {
                            mb: 2
                          }
                        }}
                        key={supporter.address}
                      >
                        <Box>
                          <Link
                            href={{
                              pathname: `/address/${supporter.address}`
                            }}
                            passHref
                          >
                            <ThemeUILink sx={{ mt: 'auto' }} title="Profile details">
                              <Text
                                sx={{
                                  color: 'accentBlue',
                                  fontSize: 2,
                                  ':hover': { color: 'blueLinkHover' }
                                }}
                              >
                                <AddressIconBox
                                  address={supporter.address}
                                  width={30}
                                  limitTextLength={bpi === 0 ? 12 : 14}
                                />
                              </Text>
                            </ThemeUILink>
                          </Link>
                        </Box>

                        <Box sx={{ textAlign: 'right' }}>
                          <Text color="onSecondary">
                            {supporter.percent}% ({new BigNumberJS(supporter.deposits).toFormat(2)} MKR)
                          </Text>
                        </Box>
                      </Flex>
                    ))}
                </Box>
              </Card>
            </ErrorBoundary>
          </Box>
          <ResourceBox type={'executive'} />
          <ResourceBox type={'general'} />
        </Stack>
      </SidebarLayout>
    </PrimaryLayout>
  );
};

// HOC to fetch the proposal depending on the network
export default function ProposalPage({
  proposal: prefetchedProposal,
  spellDiffs: prefetchedSpellDiffs
}: {
  proposal?: Proposal;
  spellDiffs: SpellDiff[];
}): JSX.Element {
  const [_proposal, _setProposal] = useState<Proposal>();
  const [error, setError] = useState<string>();
  const { query } = useRouter();
  const { network } = useActiveWeb3React();

  const spellAddress = prefetchedProposal?.address;
  const nextCastTime = prefetchedProposal?.spellData?.nextCastTime?.getTime();
  const hasBeenCast = prefetchedProposal?.spellData.hasBeenCast;

  // If we didn't fetch the diffs during build, attempt to fetch them now
  const { data: diffs } = useSWR(
    prefetchedProposal && prefetchedSpellDiffs.length === 0
      ? `/api/executive/state-diff/${spellAddress}?nextCastTime=${nextCastTime}&hasBeenCast=${hasBeenCast}&network=${network}`
      : null
  );

  // fetch proposal contents at run-time if on any network other than the default
  useEffect(() => {
    if (!network) return;
    if (!isDefaultNetwork(network) && query['proposal-id']) {
      fetchJson(`/api/executive/${query['proposal-id']}?network=${network}`)
        .then(response => {
          _setProposal(response);
        })
        .catch(setError);
    }
  }, [query['proposal-id'], network]);

  if (error || (isDefaultNetwork(network) && !prefetchedProposal?.key)) {
    return (
      <ErrorPage
        statusCode={404}
        title="Executive proposal either does not exist, or could not be fetched at this time"
      />
    );
  }

  if (!isDefaultNetwork(network) && !_proposal)
    return (
      <PrimaryLayout shortenFooter={true}>
        <p>Loading…</p>
      </PrimaryLayout>
    );

  const proposal = isDefaultNetwork(network) ? prefetchedProposal : _proposal;
  const spellDiffs = prefetchedSpellDiffs.length > 0 ? prefetchedSpellDiffs : diffs;

  return (
    <ErrorBoundary componentName="Executive Page">
      <ProposalView proposal={proposal as Proposal} spellDiffs={spellDiffs} />
    </ErrorBoundary>
  );
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  // fetch proposal contents at build-time if on the default network
  const proposalId = (params || {})['proposal-id'] as string;

  const proposal: Proposal | null = await getExecutiveProposal(proposalId, DEFAULT_NETWORK.network);

  // Only fetch at build time if spell has been cast, and it's not older than two months (to speed up builds)
  const spellDiffs: SpellDiff[] =
    proposal &&
    proposal.spellData?.hasBeenCast &&
    isAfter(new Date(proposal?.date), sub(new Date(), { months: 2 }))
      ? await fetchHistoricalSpellDiff(proposal.address)
      : [];

  return {
    revalidate: 60 * 60, // Revalidate each hour
    props: {
      proposal,
      spellDiffs,
      revalidate: 30 // Ensures that after a spell is cast, we regenerate the static page with fetchHistoricalSpellDiff
    }
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const proposals = await getGithubExecutives(DEFAULT_NETWORK.network);
  const MAX = 10;

  const paths = proposals.slice(0, MAX).map(proposal => `/executive/${proposal.key}`);

  return {
    paths,
    fallback: 'blocking'
  };
};
