import { Box, Heading, Card, Text } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';

import VotingStatus from './PollVotingStatus';
import QuickVote from './QuickVote';
import { isActivePoll } from 'modules/polling/helpers/utils';
import { Poll } from 'modules/polling/types';
import { useAccount } from 'modules/app/hooks/useAccount';

export default function VoteBox({ poll, ...props }: { poll: Poll }): JSX.Element {
  const bpi = useBreakpointIndex();
  const { account } = useAccount();
  const canVote = !!account && isActivePoll(poll);
  const showQuickVote = canVote && bpi > 0;

  return (
    <Box {...props} data-testid="poll-vote-box">
      <Heading mb={2} as="h3" variant="microHeading">
        Your Vote
      </Heading>
      <Card variant="compact">
        <Heading as="h3" variant="microHeading">
          {poll.title}
        </Heading>
        <Text as="p" sx={{ fontSize: 3, color: 'textSecondary', my: 2 }}>
          {poll.summary}
        </Text>
        <VotingStatus sx={{ my: 2, textAlign: 'center' }} poll={poll} />
        {showQuickVote && <QuickVote poll={poll} showHeader={false} />}
      </Card>
    </Box>
  );
}
