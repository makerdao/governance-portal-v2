/** @jsx jsx */
import { Box, Heading, Card, Text, jsx } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';

import VotingStatus from './PollVotingStatus';
import QuickVote from './QuickVote';
import useAccountsStore from 'stores/accounts';
import { isActivePoll } from 'modules/polling/helpers/utils';
import { Poll } from 'modules/polling/types';

export default function VoteBox({ poll, ...props }: { poll: Poll }): JSX.Element {
  const bpi = useBreakpointIndex();
  const account = useAccountsStore(state => state.currentAccount);
  const canVote = !!account && isActivePoll(poll);
  const showQuickVote = canVote && bpi > 0;

  return (
    <Box {...props}>
      <Heading mb={2} as="h3" variant="microHeading">
        Your Vote
      </Heading>
      <Card variant="compact">
        <Heading as="h3" variant="microHeading">
          {poll.title}
        </Heading>
        <Text sx={{ fontSize: 3, color: 'textSecondary', my: 1 }}>{poll.summary}</Text>
        <VotingStatus sx={{ my: 2, mx: 3, textAlign: 'center' }} poll={poll} />
        {showQuickVote && <QuickVote poll={poll} showHeader={false} account={account} />}
      </Card>
    </Box>
  );
}
