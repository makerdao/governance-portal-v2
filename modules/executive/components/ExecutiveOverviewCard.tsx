import { useState } from 'react';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { Text, Flex, Box, Button, Badge, Divider, Card } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { BigNumber } from 'ethers';
import Skeleton from 'modules/app/components/SkeletonThemed';
import { formatDateWithoutTime } from 'lib/datetime';
import { formatValue } from 'lib/string';
import { getStatusText } from 'modules/executive/helpers/getStatusText';
import { InternalLink } from 'modules/app/components/InternalLink';
import { Proposal } from 'modules/executive/types';
import VoteModal from './VoteModal';
import { CardHeader } from 'modules/app/components/Card/CardHeader';
import { CardTitle } from 'modules/app/components/Card/CardTitle';
import { CardSummary } from 'modules/app/components/Card/CardSummary';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import { ZERO_ADDRESS } from 'modules/web3/constants/addresses';
import { StatBox } from 'modules/app/components/StatBox';
import { useExecutiveComments } from 'modules/comments/hooks/useExecutiveComments';
import CommentCount from 'modules/comments/components/CommentCount';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { useSpellData } from '../hooks/useSpellData';

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
  mkrOnHat
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
      <Card sx={{ p: [0, 0] }}>
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
    >
      <Flex
        sx={{
          flexDirection: 'column',
          px: [3, 4],
          py: [3, proposal.spellData?.hasBeenScheduled ? 3 : 4],
          height: '330px',
          justifyContent: 'space-between'
        }}
      >
        <Flex sx={{ justifyContent: 'space-between' }}>
          <Box>
            <Flex sx={{ flexDirection: 'column', height: '200px' }}>
              <InternalLink href={`/executive/${proposal.key}`} title="View executive details">
                <>
                  <CardHeader text={`posted ${formatDateWithoutTime(proposal.date)}`} />
                  <CardTitle title={proposal.title} styles={{ mt: 2 }} />
                  <CardSummary text={proposal.proposalBlurb} styles={{ mt: 2 }} />
                </>
              </InternalLink>
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
                  <Box
                    sx={{
                      borderRadius: '12px',
                      padding: '4px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      color: 'tagColorThree',
                      backgroundColor: 'tagColorThreeBg',
                      my: 2
                    }}
                  >
                    <Text sx={{ fontSize: 2 }}>Governing Proposal</Text>
                  </Box>
                ) : null}
              </Flex>
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
              </Box>
            )}
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
              </Flex>
            )}
          </Box>
        </Flex>

        {comments && comments.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <InternalLink
              href={`/executive/${proposal.key}?network=${network}#comments`}
              title="View Comments"
            >
              <CommentCount count={comments.length} />
            </InternalLink>
          </Box>
        )}
        <Flex sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ width: '50%' }}>
            <InternalLink href={`/executive/${proposal.key}`} title="View executive details">
              <Button
                variant="outline"
                sx={{
                  mt: canVote ? 3 : 0,
                  borderColor: 'text',
                  color: 'text',
                  ':hover': { color: 'text', borderColor: 'onSecondary', backgroundColor: 'background' }
                }}
              >
                View Details
              </Button>
            </InternalLink>
          </Box>
          <Box sx={{ width: '50%' }}>
            {spellData?.mkrSupport === undefined ? (
              <Box sx={{ width: 6, m: 1 }}>
                <Skeleton />
              </Box>
            ) : (
              <StatBox
                value={formatValue(BigNumber.from(spellData?.mkrSupport))}
                label="MKR Supporting"
                styles={{ textAlign: 'right' }}
              />
            )}
          </Box>
        </Flex>
      </Flex>

      {voting && <VoteModal proposal={proposal} close={() => setVoting(false)} />}

      <Flex sx={{ flexDirection: 'column', justifySelf: 'flex-end' }}>
        <Divider my={0} />
        <Flex sx={{ py: 2, justifyContent: 'center' }}>
          <Text
            data-testid="proposal-status"
            as="p"
            variant="caps"
            sx={{
              textAlign: 'center',
              px: [3, 4],
              mb: 1,
              wordBreak: 'break-word'
            }}
          >
            {getStatusText({ proposalAddress: proposal.address, spellData, mkrOnHat })}
          </Text>
        </Flex>
      </Flex>
    </Card>
  );
}
