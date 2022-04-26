import { useState } from 'react';
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
          justifyContent: 'space-between'
        }}
      >
        <Flex sx={{ justifyContent: 'space-between' }}>
          <Box>
            <Flex sx={{ flexDirection: 'column' }}>
              <InternalLink href={`/executive/${proposal.key}`} title="View executive details">
                <>
                  <CardHeader text={`posted ${formatDateWithoutTime(proposal.date)}`} />
                  <CardTitle title={proposal.title} styles={{ mt: 2 }} />
                  <CardSummary text={proposal.proposalBlurb} styles={{ my: 2 }} />
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
          </Box>
        </Flex>

        <Flex sx={{ flexDirection: 'column' }}>
          <Box sx={{ mt: 2, mb: 1 }}>
            {comments && comments.length > 0 && (
              <InternalLink
                href={`/executive/${proposal.key}?network=${network}#comments`}
                title="View Comments"
              >
                <CommentCount count={comments.length} />
              </InternalLink>
            )}
          </Box>
          <Flex
            sx={{ alignItems: ['flex-end', 'center'], justifyContent: 'space-between', height: ['auto', 74] }}
          >
            <Flex sx={{ flexDirection: ['column-reverse', 'row'], width: '50%' }}>
              <InternalLink href={`/executive/${proposal.key}`} title="View executive details">
                <Button
                  variant="outline"
                  sx={{
                    borderColor: 'text',
                    color: 'text',
                    width: 122,
                    mt: [2, 0],
                    ':hover': { color: 'text', borderColor: 'onSecondary', backgroundColor: 'background' }
                  }}
                >
                  View Details
                </Button>
              </InternalLink>
              {canVote && (
                <Button
                  variant="primaryOutline"
                  sx={{ ml: [0, 3], width: 122 }}
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
            </Flex>
            <Flex>
              {spellData?.mkrSupport === undefined ? (
                <Box sx={{ width: 6, ml: 'auto', height: '100%' }}>
                  <Skeleton />
                </Box>
              ) : (
                <StatBox
                  value={formatValue(BigNumber.from(spellData?.mkrSupport))}
                  label="MKR Supporting"
                  styles={{ textAlign: 'right' }}
                />
              )}
            </Flex>
          </Flex>
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
