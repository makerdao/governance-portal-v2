/** @jsx jsx */
import { useState } from 'react';
import Link from 'next/link';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { Text, Flex, Box, Button, Badge, Divider, Card, jsx } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import Skeleton from 'components/SkeletonThemed';
import Bignumber from 'bignumber.js';
import { getNetwork } from 'lib/maker';
import { formatDateWithoutTime } from 'lib/utils';
import { useVotedProposals } from 'lib/hooks';
import { getStatusText } from 'lib/executive/getStatusText';
import useAccountsStore from 'stores/accounts';
import { ZERO_ADDRESS } from 'stores/accounts';
import { Proposal } from 'types/proposal';
import { SpellData } from 'types/spellData';
import Stack from 'components/layouts/Stack';
import VoteModal from './VoteModal';
import { useAnalytics } from 'lib/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'lib/client/analytics/analytics.constants';

type Props = {
  proposal: Proposal;
  spellData?: SpellData;
  isHat: boolean;
};

export default function ExecutiveOverviewCard({ proposal, spellData, isHat, ...props }: Props): JSX.Element {
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.EXECUTIVE);

  const account = useAccountsStore(state => state.currentAccount);
  const [voting, setVoting] = useState(false);
  const { data: votedProposals } = useVotedProposals();
  const network = getNetwork();
  const bpi = useBreakpointIndex();
  const canVote = !!account;
  const hasVotedFor =
    votedProposals &&
    !!votedProposals.find(
      proposalAddress => proposalAddress.toLowerCase() === proposal.address.toLowerCase()
    );

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
                posted {formatDateWithoutTime(proposal.date)}
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
                    trackButtonClick('openExecVoteModal');
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
        <Divider my={0} />
        <Flex p={3} sx={{ justifyContent: 'center' }}>
          <Text sx={{ fontSize: [2, 3], color: 'onSecondary' }}>
            {getStatusText(proposal.address, spellData)}
          </Text>
        </Flex>
      </Card>
    </Link>
  );
}
