/** @jsx jsx */

import { Box, Heading, Card, Text, jsx } from 'theme-ui';
import VotingStatus from './VotingStatus';
import QuickVote from './QuickVote';
import useAccountsStore from '../../stores/accounts';
import useBallotStore from '../../stores/ballot';

import { isActivePoll } from '../../lib/utils';
import { useBreakpointIndex } from '@theme-ui/match-media';

export default function (props): JSX.Element {
  const bpi = useBreakpointIndex();
  const account = useAccountsStore(state => state.currentAccount);
  const txId = useBallotStore(state => state.txId);
  const poll = props.poll || {};
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
        <Text sx={{ fontSize: '16px', color: 'textMuted', mt: 1, fontWeight: 'normal' }}>{poll.summary}</Text>

        {showQuickVote && <QuickVote poll={poll} showHeader={false} />}
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
