/** @jsx jsx */
import { Box, Heading, Card, Text, jsx } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';

import VotingStatus from '../PollVotingStatus';
import QuickVote from '../QuickVote';
import useAccountsStore from '../../../stores/accounts';
import { isActivePoll } from '../../../lib/utils';
import Poll from '../../../types/poll';

export default function ({ poll, ...props }: { poll: Poll }): JSX.Element {
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
        <Text sx={{ fontSize: 3, color: 'textSecondary', mt: 1 }}>{poll.summary}</Text>
        {showQuickVote && <QuickVote poll={poll} showHeader={false} account={account} />}
        {isActivePoll(poll) ? '' : <VotingStatus sx={{ mt: 3, mx: 3, textAlign: 'center' }} poll={poll} />}
      </Card>
    </Box>
  );
}

//Mobile Vote Button When Needed
// {canVote &&
//   bpi === 0 &&
//   (onBallot ? (
//     <Button
//       variant="outline"
//       mr={2}
//       onClick={startMobileVoting}
//       sx={{
//         display: 'flex',
//         flexDirection: 'row',
//         flexWrap: 'nowrap',
//         alignItems: 'center'
//       }}
//     >
//       <Icon name="edit" size={3} mr={2} />
//       Edit Choices
//     </Button>
//   ) : (
//     <Button variant="primary" mr={2} onClick={startMobileVoting}>
//       Vote
//     </Button>
//   ))}
