import useBallotStore from '../stores/ballotStore';
import { Box, Flex, Button } from 'theme-ui';

export function SubmitBallotsButtons({ onSubmit }: { onSubmit: () => void }): React.ReactElement {
  const { voteTxId, ballot, submitBallot, signComments, signedMessage, comments } = useBallotStore(state => ({
    clearTx: state.clearTx,
    voteTxId: state.txId,
    ballot: state.ballot,
    submitBallot: state.submitBallot,
    signComments: state.signComments,
    signedMessage: state.signedMessage,
    comments: state.comments
  }));

  const ballotLength = Object.keys(ballot).length;

  return (
    <Flex p={3} sx={{ flexDirection: 'column', width: '100%', m: '0' }}>
      {comments.filter(i => !!i.comment).length > 0 ? (
        <Box>
          <Button
            onClick={() => {
              signComments();
            }}
            variant="primaryOutline"
            disabled={!ballotLength || !!voteTxId || !!signedMessage}
            sx={{ width: '100%' }}
          >
            1 - Sign your comments
          </Button>
          <Button
            mt={2}
            onClick={() => {
              submitBallot();
              onSubmit();
            }}
            variant="primaryLarge"
            disabled={!ballotLength || !!voteTxId || !signedMessage}
            sx={{ width: '100%' }}
          >
            2 - Submit Your Ballot
          </Button>
        </Box>
      ) : (
        <Button
          onClick={() => {
            submitBallot();
            onSubmit();
          }}
          variant="primaryLarge"
          disabled={!ballotLength || !!voteTxId}
          sx={{ width: '100%' }}
        >
          Submit Your Ballot ({ballotLength} vote{ballotLength === 1 ? '' : 's'})
        </Button>
      )}
    </Flex>
  );
}
