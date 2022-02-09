import { Icon } from '@makerdao/dai-ui-icons';
import useBallotStore from '../stores/ballotStore';
import { Box, Flex, Button, Text } from 'theme-ui';
import { useAccount } from 'modules/app/hooks/useAccount';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { useSubmitBallot } from '../hooks/useSubmitBallot';

export function SubmitBallotsButtons({ onSubmit }: { onSubmit: () => void }): React.ReactElement {
  const account = useAccount();
  const { library } = useActiveWeb3React();
  const { ballot, signComments, signedMessage, comments } = useBallotStore(state => ({
    ballot: state.ballot,
    signComments: state.signComments,
    signedMessage: state.signedMessage,
    comments: state.comments
  }));

  const { submitBallot, tx: transaction, txId: voteTxId } = useSubmitBallot();

  const ballotLength = Object.keys(ballot).length;

  return (
    <Flex p={3} sx={{ flexDirection: 'column', width: '100%', m: '0' }}>
      {comments.filter(i => !!i.comment).length > 0 ? (
        <Box>
          <Button
            onClick={() => {
              signComments(account.account as string, library);
            }}
            variant="primaryOutline"
            data-testid="sign-comments-button"
            disabled={!ballotLength || !!(voteTxId && transaction?.status !== 'error') || !!signedMessage}
            sx={{ width: '100%' }}
          >
            <Flex sx={{ justifyContent: 'center', alignItems: 'center' }}>
              {!!signedMessage && (
                <Icon name="checkmark" color="primary" sx={{ mr: 3 }} data-testid="checkmark" />
              )}
              <Text>1 - Sign your comments</Text>
            </Flex>
          </Button>
          <Button
            mt={2}
            data-testid="submit-ballot-button"
            onClick={() => {
              submitBallot();
              onSubmit();
            }}
            variant="primaryLarge"
            disabled={!ballotLength || !!(voteTxId && transaction?.status !== 'error') || !signedMessage}
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
          data-testid="submit-ballot-button"
          variant="primaryLarge"
          disabled={!ballotLength || !!(voteTxId && transaction?.status !== 'error')}
          sx={{ width: '100%' }}
        >
          Submit Your Ballot ({ballotLength} vote{ballotLength === 1 ? '' : 's'})
        </Button>
      )}
    </Flex>
  );
}
