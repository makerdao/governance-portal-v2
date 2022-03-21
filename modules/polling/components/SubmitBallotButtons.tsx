import { Icon } from '@makerdao/dai-ui-icons';
import { Box, Flex, Button, Text } from 'theme-ui';
import { useContext } from 'react';
import { BallotContext } from '../context/BallotContext';

export function SubmitBallotsButtons({ onSubmit }: { onSubmit: () => void }): React.ReactElement {
  const { signComments, transaction, submitBallot, ballotCount, commentsCount, commentsSignature } =
    useContext(BallotContext);

  return (
    <Flex p={3} sx={{ flexDirection: 'column', width: '100%', m: '0' }}>
      {commentsCount > 0 ? (
        <Box>
          <Button
            onClick={() => {
              signComments();
            }}
            variant="primaryOutline"
            data-testid="sign-comments-button"
            disabled={
              !ballotCount || !!(transaction && transaction?.status !== 'error') || !!commentsSignature
            }
            sx={{ width: '100%' }}
          >
            <Flex sx={{ justifyContent: 'center', alignItems: 'center' }}>
              {!!commentsSignature && (
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
            disabled={
              !ballotCount || !!(transaction && transaction?.status !== 'error') || !commentsSignature
            }
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
          disabled={!ballotCount || !!(transaction && transaction?.status !== 'error')}
          sx={{ width: '100%' }}
        >
          Submit Your Ballot ({ballotCount} vote{ballotCount === 1 ? '' : 's'})
        </Button>
      )}
    </Flex>
  );
}
