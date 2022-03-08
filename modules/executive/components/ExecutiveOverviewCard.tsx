import { useState } from 'react';
import Link from 'next/link';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { Text, Flex, Box, Button, Badge, Divider, Card, Link as ThemeUILink } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { BigNumber } from 'ethers';
import Skeleton from 'modules/app/components/SkeletonThemed';
import { formatDateWithoutTime } from 'lib/datetime';
import { formatValue } from 'lib/string';
import { getStatusText } from 'modules/executive/helpers/getStatusText';
import { Proposal } from 'modules/executive/types';
import Stack from 'modules/app/components/layout/layouts/Stack';
import VoteModal from './VoteModal';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import { ZERO_ADDRESS } from 'modules/web3/constants/addresses';
import { useExecutiveComments } from 'modules/comments/hooks/useExecutiveComments';
import CommentCount from 'modules/comments/components/CommentCount';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { useSpellData } from '../hooks/useSpellData';
import { parseUnits } from 'ethers/lib/utils';

type Props = {
  proposal: Proposal;
  isHat: boolean;
  account?: string;
  network: SupportedNetworks;
  votedProposals: string[];
  mkrOnHat?: BigNumber;
};

export default function ExecutiveOverviewCard({
  proposal,
  isHat,
  network,
  account,
  votedProposals,
  mkrOnHat,
  ...props
}: Props): JSX.Element {
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.EXECUTIVE);
  const [voting, setVoting] = useState(false);
  const bpi = useBreakpointIndex();
  const { comments } = useExecutiveComments(proposal.address);
  const { data: spellData } = useSpellData(proposal.address);

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

  const canVote = !!account;

  return (
    <Card
      sx={{
        p: [0, 0]
      }}
      {...props}
    >
      <Box px={[3, 4]} py={[3, proposal.spellData?.hasBeenScheduled ? 3 : 4]}>
        <Flex sx={{ justifyContent: 'space-between' }}>
          <Stack gap={2}>
            <Link
              href={{ pathname: '/executive/[proposal-id]' }}
              as={{ pathname: `/executive/${proposal.key}` }}
              passHref
            >
              <ThemeUILink variant="nostyle" title="View Executive Details">
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
              </ThemeUILink>
            </Link>
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
                  {formatValue(BigNumber.from(spellData?.mkrSupport), 'wad', 2)} MKR Supporting
                </Badge>
              )}
            </Flex>
            {bpi === 0 && (
              <Box sx={{ pt: 2 }}>
                {canVote && (
                  <Button
                    variant="primaryOutline"
                    sx={{ width: '100%', py: 2 }}
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
                )}
                <Link
                  href={{ pathname: '/executive/[proposal-id]' }}
                  as={{ pathname: `/executive/${proposal.key}` }}
                  passHref
                >
                  <ThemeUILink variant="nostyle" title="View Poll Details" sx={{ width: '100%' }}>
                    <Button
                      variant="outline"
                      sx={{
                        width: '100%',
                        my: canVote ? 3 : 0,
                        borderColor: 'text',
                        color: 'text',
                        ':hover': { color: 'text', borderColor: 'onSecondary', backgroundColor: 'background' }
                      }}
                    >
                      View Details
                    </Button>
                  </ThemeUILink>
                </Link>
              </Box>
            )}
          </Stack>
          {bpi > 0 && (
            <Flex
              sx={{
                mx: 4,
                alignItems: 'center',
                justifyContent: 'center',
                width: 7,
                flexDirection: 'column'
              }}
            >
              {canVote && (
                <Button
                  variant="primaryOutline"
                  sx={{ width: '100%', py: 2 }}
                  disabled={hasVotedFor && votedProposals && votedProposals.length === 1}
                  onClick={ev => {
                    setVoting(true);
                    ev.stopPropagation();
                  }}
                  data-testid="vote-button-exec-overview-card"
                >
                  Vote
                </Button>
              )}
              <Link
                href={{ pathname: '/executive/[proposal-id]' }}
                as={{ pathname: `/executive/${proposal.key}` }}
                passHref
              >
                <ThemeUILink variant="nostyle" title="View Poll Details" sx={{ width: '100%' }}>
                  <Button
                    variant="outline"
                    sx={{
                      width: '100%',
                      mt: canVote ? 3 : 0,
                      borderColor: 'text',
                      color: 'text',
                      ':hover': { color: 'text', borderColor: 'onSecondary', backgroundColor: 'background' }
                    }}
                  >
                    View Details
                  </Button>
                </ThemeUILink>
              </Link>
            </Flex>
          )}
        </Flex>

        {comments && comments.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <ThemeUILink
              href={`/executive/${proposal.key}?network=${network}#comments`}
              title="View Comments"
            >
              <CommentCount count={comments.length} />
            </ThemeUILink>
          </Box>
        )}
      </Box>

      {voting && <VoteModal proposal={proposal} close={() => setVoting(false)} />}

      <Divider my={0} />
      <Flex sx={{ py: 2, justifyContent: 'center', fontSize: [1, 2], color: 'onSecondary' }}>
        <Text as="p" sx={{ textAlign: 'center', px: [3, 4], mb: 1, wordBreak: 'break-word' }}>
          {getStatusText({ proposalAddress: proposal.address, spellData: proposal.spellData, mkrOnHat })}
        </Text>
      </Flex>
    </Card>
  );
}
