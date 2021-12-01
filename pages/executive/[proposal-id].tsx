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
import getMaker, { getNetwork, isDefaultNetwork } from 'lib/maker';
import { cutMiddle, limitString } from 'lib/string';
import { getStatusText } from 'modules/executive/helpers/getStatusText';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import { getEtherscanLink } from 'lib/utils';

// stores
import useAccountsStore from 'stores/accounts';
import { ZERO_ADDRESS } from 'stores/accounts';

//components
import Comments from 'modules/executive/components/Comments';
import VoteModal from 'modules/executive/components/VoteModal';
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
import { CurrencyObject } from 'types/currency';
import { fetchJson } from 'lib/fetchJson';
import { analyzeSpell } from 'pages/api/executive/analyze-spell/[address]';
import { SupportedNetworks } from 'lib/constants';
import { Address } from 'modules/address/components/Address';

import { config } from 'lib/config';

export type SpellDiff = {
  decoded_contract: string;
  decoded_location: string;
  decoded_from_val: string;
  decoded_to_val: string;
};

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

const ProposalView = ({ proposal, spellDiffs }: Props): JSX.Element => {
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.POLL_DETAIL);
  const { data: spellData } = useSpellData(proposal.address);

  const network = getNetwork();
  const account = useAccountsStore(state => state.currentAccount);
  const bpi = useBreakpointIndex();

  const { data: allSupporters, error: supportersError } = useSWR(
    `/api/executive/supporters?network=${getNetwork()}`
  );

  const { data: votedProposals } = useVotedProposals();
  const { data: mkrOnHat } = useMkrOnHat();
  const { data: hat } = useHat();
  const isHat = hat && hat.toLowerCase() === proposal.address.toLowerCase();

  const { data: comments, error: commentsError } = useSWR(
    `/api/executive/comments/list/${proposal.address}`,
    { refreshInterval: 60000 }
  );

  const supporters = allSupporters ? allSupporters[proposal.address.toLowerCase()] : null;

  const [voting, setVoting] = useState(false);
  const close = () => setVoting(false);

  const commentsTab = (
    <div key={'comments'} sx={{ p: [3, 4] }}>
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

      {voting && <VoteModal close={close} proposal={proposal} currentSlate={votedProposals} />}
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
            {'about' in proposal ? (
              <Tabs
                tabListStyles={{ pl: [3, 4] }}
                tabTitles={[
                  'Proposal Detail',

                  'Spell Details',
                  `Comments ${comments ? `(${comments.length})` : ''}`
                ]}
                tabPanels={[
                  <div
                    key={'about'}
                    sx={{ variant: 'markdown.default', p: [3, 4] }}
                    dangerouslySetInnerHTML={{ __html: editMarkdown(proposal.content) }}
                  />,
                  <div key={'spell'} sx={{ p: [3, 4] }}>
                    <SpellEffectsTab proposal={proposal} spellData={spellData} spellDiffs={spellDiffs} />
                  </div>,
                  commentsTab
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
export default function ProposalPage({
  proposal: prefetchedProposal,
  spellDiffs: prefetchedSpellDiffs
}: {
  proposal?: Proposal;
  spellDiffs: SpellDiff[];
}): JSX.Element {
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
  return <ProposalView proposal={proposal as Proposal} spellDiffs={prefetchedSpellDiffs} />;
}

///// BEGIN API STUFF

async function ethCall(provider, encoder, method, to) {
  const calldata = {
    to,
    data: encoder.encodeFunctionData(method)
  };

  return encoder.decodeFunctionResult(method, await provider.call(calldata));
}

const getSpellData = async (proposalAddress): Promise<SpellDiff[]> => {
  if (!proposalAddress) return [];
  const castSig = '0x96d373e5';
  const network = SupportedNetworks.MAINNET;
  const maker = await getMaker(network);
  // We need this to check if the spell has been cast
  const data = await analyzeSpell(proposalAddress, maker);
  console.log('spelldata2', data);

  // const hasCast = data.hasBeenCast;
  const hasCast = false;

  if (hasCast) {
    // Need to find the tx of the cast spell
    const provider = new ethers.providers.EtherscanProvider();
    const history = await provider.getHistory(proposalAddress);
    const castTx = history.filter(h => h.data === castSig);

    if (castTx.length > 1) {
      // TODO: Need to loop & fetch the txns from the provider to find the successful one
      console.warn('multiple matching txs', castTx);
    }
    const [{ hash }] = castTx;

    // TODO: currently the endpoint is hardcoded to only allow the following hash:
    const hcHash = '0xf91cdba571422ba3da9e7b79cbc0d51e8208244c2679e4294eec4ab5807acf7f';
    const url = `http://18.157.179.179/api/v1/transactions/${hcHash}/diffs/decoded`;

    const diff = await fetchJson(url);

    return diff;
  } else {
    console.log('HAS NOT BEEN CAST');
    // TODO split these two blocks into own function
    const spellAddress = '0x82b24156f0223879aaaC2DD0996a25Fe1FF74e1a'; // nov 11

    const network = SupportedNetworks.MAINNET;
    const maker = await getMaker(network);

    const { MCD_PAUSE, MCD_PAUSE_PROXY } = maker.service('smartContract').getContractAddresses();
    const provider = ethers.getDefaultProvider(network, {
      infura: config.INFURA_KEY,
      alchemy: config.ALCHEMY_KEY
    });
    const encoder = new ethers.utils.Interface([
      'function sig() returns (bytes)',
      'function action() returns (address)',
      'function done() returns (bool)',
      'function exec(address, bytes)',
      'function actions()'
    ]);

    const [usr] = await ethCall(provider, encoder, 'action', spellAddress);

    console.log('^^^usr2', usr);
    const data2 = encoder.encodeFunctionData('exec', [usr, encoder.encodeFunctionData('actions')]);
    console.log('^^^data3', data2);

    // const from_address = MCD_PAUSE;
    // const to_address = '0xad92310c5e1b3622ab6987917d6a074bca428e61'; // spell address from example
    // const data = '0x2b5e3af16b1880000';
    // OLD WAY
    // const to_address = MCD_PAUSE_PROXY;
    // const data = data2;
    // const gas = '0x1c6b9e';
    // const gas_price = '0x23bd501f00';
    // const execute_on_top_of_block_number = 13624482; // block fromlatest cast
    // const timestamp = 1637047755; // 11/15 5:29pm mst
    // const url = `http://3.123.40.243/api/v1/transactions/simulation/?from_address=${from_address}&to_address=${to_address}&data=${data}&gas=${gas}&gas_price=${gas_price}&execute_on_top_of_block_number=${execute_on_top_of_block_number}&timestamp=${timestamp}`;

    // New way
    const from_address = '0x5cab1e5286529370880776461c53a0e47d74fb63'; // Think its just the caster of the spell, could be anyone?
    const to_address = '0x82b24156f0223879aaac2dd0996a25fe1ff74e1a'; // the spell address
    // const data = data2;
    const data = '0x96d373e5'; // The spell signature can also be pulled from the interface but should always be "cast" right?
    const gas = '0x1c6b9e'; // from the example, should see if we can get it dynamically
    const gas_price = '0x23bd501f00';
    const execute_on_top_of_block_number = 13624481; // from example. could be current block, eh?
    // const timestamp = 1637047755; // 11/15 5:29pm mst
    const value = 0; // think its always 0

    const ip = '18.157.179.179';
    const url = `http://${ip}/api/v1/transactions/simulation/?from_address=${from_address}&to_address=${to_address}&data=${data}&gas=${gas}&gas_price=${gas_price}&execute_on_top_of_block_number=${execute_on_top_of_block_number}&value=${value}`;
    // const url =
    //   'http://18.157.179.179/api/v1/transactions/simulation/?from_address=0x5cab1e5286529370880776461c53a0e47d74fb63&to_address=0x82b24156f0223879aaac2dd0996a25fe1ff74e1a&data=0x96d373e5&gas=0x1c6b9e&gas_price=0x23bd501f00&value=0&execute_on_top_of_block_number=13624481';
    const { diffs } = await fetchJson(url);
    return diffs;
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  // fetch proposal contents at build-time if on the default network
  invariant(params?.['proposal-id'], 'getStaticProps proposal id not found in params');
  const proposalId = params['proposal-id'] as string;

  const proposal: Proposal | null = ethers.utils.isAddress(proposalId)
    ? { address: proposalId, key: proposalId }
    : await getExecutiveProposal(proposalId);

  const spellDiffs: SpellDiff[] = await getSpellData(proposal?.address);

  return {
    props: {
      proposal,
      spellDiffs
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
