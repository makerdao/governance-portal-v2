/** @jsx jsx */
import Link from 'next/link';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { Text, Flex, Box, Button, Badge, Divider, Card, Link as InternalLink, jsx } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import useSWR from 'swr';
import Skeleton from 'react-loading-skeleton';
import Bignumber from 'bignumber.js';

import Proposal from '../../types/proposal';
import getMaker, { getNetwork } from '../../lib/maker';
import { formatDateWithTime } from '../../lib/utils';
import Stack from '../layouts/Stack';
import useAccountsStore from '../../stores/accounts';
import VoteModal from './VoteModal';
import { useState } from 'react';
import SpellData from '../../types/spellData';
import mixpanel from 'mixpanel-browser';
import { SPELL_SCHEDULED_DATE_OVERRIDES } from '../../lib/constants';
import { ZERO_ADDRESS } from '../../stores/accounts';

type Props = {
  proposal: Proposal;
  spellData?: SpellData;
  isHat: boolean;
};

export default function ExecutiveOverviewCard({ proposal, spellData, isHat, ...props }: Props): JSX.Element {
  const account = useAccountsStore(state => state.currentAccount);
  const voteProxy = useAccountsStore(state => (account ? state.proxies[account.address] : null));
  const [voting, setVoting] = useState(false);

  const { data: votedProposals } = useSWR<string[]>(
    ['/executive/voted-proposals', account?.address],
    (_, address) =>
      getMaker().then(maker =>
        maker
          .service('chief')
          .getVotedSlate(voteProxy ? voteProxy.getProxyAddress() : address)
          .then(slate => maker.service('chief').getSlateAddresses(slate))
      )
  );

  const network = getNetwork();
  const bpi = useBreakpointIndex();
  const hasVotedFor =
    votedProposals &&
    !!votedProposals.find(
      proposalAddress => proposalAddress.toLowerCase() === proposal.address.toLowerCase()
    );
  const canVote = !!account;

  if (!('about' in proposal)) {
    return (
      <Card sx={{ p: [0, 0] }} {...props}>
        <Box sx={{ p: 3 }}>
          <Text>spell address {proposal.address}</Text>
        </Box>
      </Card>
    );
  }

  return (
    <Link
      href={{ pathname: '/executive/[proposal-id]', query: { network } }}
      as={{ pathname: `/executive/${proposal.key}`, query: { network } }}
    >
      <Card
        sx={{
          p: [0, 0],
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'onSecondary'
          }
        }}
        {...props}
      >
        <Flex
          px={[3, 4]}
          py={[3, spellData?.hasBeenScheduled ? 3 : 4]}
          sx={{ justifyContent: 'space-between' }}
        >
          <Stack gap={2}>
            <Flex sx={{ justifyContent: 'space-between', flexDirection: 'row', flexWrap: 'nowrap' }}>
              <Text variant="caps" sx={{ color: 'mutedAlt' }}>
                posted {formatDateWithTime(proposal.date)}
              </Text>
            </Flex>
            <Box>
              <Text variant="microHeading" sx={{ fontSize: [3, 5], cursor: 'pointer' }}>
                {proposal.title}
              </Text>
            </Box>
            <Text
              sx={{
                fontSize: [2, 3],
                color: 'onSecondary'
              }}
            >
              {proposal.proposalBlurb}
            </Text>
            <Flex sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              {hasVotedFor && (
                <Badge
                  variant="primary"
                  sx={{
                    color: 'primary',
                    borderColor: 'primary',
                    textTransform: 'uppercase',
                    display: 'inline-flex',
                    alignItems: 'center',
                    m: 1
                  }}
                >
                  <Flex sx={{ display: 'inline-flex', pr: 2 }}>
                    <Icon name="verified" size={3} />
                  </Flex>
                  Your Vote
                </Badge>
              )}
              {isHat && proposal.address !== ZERO_ADDRESS ? (
                <Badge
                  variant="primary"
                  sx={{
                    m: 1,
                    borderColor: 'primaryAlt',
                    color: 'primaryAlt',
                    textTransform: 'uppercase'
                  }}
                >
                  Governing proposal
                </Badge>
              ) : null}
              {spellData?.mkrSupport === undefined ? (
                <Box sx={{ width: 6, m: 1 }}>
                  <Skeleton />
                </Box>
              ) : (
                <Badge
                  variant="primary"
                  sx={{
                    borderColor: 'text',
                    textTransform: 'uppercase',
                    m: 1
                  }}
                >
                  {new Bignumber(spellData.mkrSupport).toFormat(2)} MKR Supporting
                </Badge>
              )}
            </Flex>
            {canVote && bpi === 0 && (
              <Box sx={{ pt: 2 }}>
                <Button
                  variant="primaryOutline"
                  sx={{ width: '100%' }}
                  disabled={hasVotedFor && votedProposals && votedProposals.length === 1}
                  onClick={ev => {
                    mixpanel.track('btn-click', {
                      id: 'openExecVoteModal',
                      product: 'governance-portal-v2',
                      page: 'Executive'
                    });
                    setVoting(true);
                    ev.stopPropagation();
                  }}
                  data-testid="vote-button-exec-overview-card"
                >
                  Vote
                </Button>
              </Box>
            )}
          </Stack>
          {canVote && bpi > 0 && (
            <Flex sx={{ mx: 4, alignItems: 'center', justifyContent: 'center', width: 7 }}>
              <Button
                variant="primaryOutline"
                sx={{ width: '100%' }}
                disabled={hasVotedFor && votedProposals && votedProposals.length === 1}
                onClick={ev => {
                  setVoting(true);
                  ev.stopPropagation();
                }}
                data-testid="vote-button-exec-overview-card"
              >
                Vote
              </Button>
            </Flex>
          )}
        </Flex>
        {voting && (
          <VoteModal proposal={proposal} currentSlate={votedProposals} close={() => setVoting(false)} />
        )}
        {(spellData?.hasBeenScheduled || proposal.address === ZERO_ADDRESS) && (
          <>
            <Divider my={0} />
            <Flex p={3} sx={{ justifyContent: 'center' }}>
              {proposal.address === ZERO_ADDRESS ? (
                <Text sx={{ fontSize: [2, 3], color: 'onSecondary' }}>
                  This proposal surpased the 80,000 MKR threshold on {formatDateWithTime(1607704862000)} – the
                  new chief has been activated!
                </Text>
              ) : (
                spellData && (
                  <Text sx={{ fontSize: [2, 3], color: 'onSecondary' }}>
                    Passed on {formatDateWithTime(spellData.datePassed)}.{' '}
                    {typeof spellData.dateExecuted === 'string' ? (
                      <>Executed on {formatDateWithTime(spellData.dateExecuted)}.</>
                    ) : (
                      <>
                        Available for execution on{' '}
                        {SPELL_SCHEDULED_DATE_OVERRIDES[proposal.address] ||
                          formatDateWithTime(spellData.nextCastTime || spellData.eta)}
                        .
                      </>
                    )}
                  </Text>
                )
              )}
            </Flex>
          </>
        )}
      </Card>
    </Link>
  );
}
