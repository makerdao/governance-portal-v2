import { Icon } from '@makerdao/dai-ui-icons';
import { Box, Flex, Button, Text, Heading } from 'theme-ui';
import { useContext } from 'react';
import { BallotContext } from '../context/BallotContext';

export function SubmitBallotsButtons({ onSubmit }: { onSubmit: () => void }): React.ReactElement | null {
  const {
    signComments,
    transaction,
    submitBallot,
    ballotCount,
    commentsCount,
    commentsSignature,
    setStep,
    ballotStep
  } = useContext(BallotContext);

  switch (ballotStep) {
    case 'initial':
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
                setStep('method-select');
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
    case 'method-select':
      return (
        <Flex sx={{ flexDirection: 'column', p: 3 }}>
          <Heading variant="microHeading" sx={{ mt: 3, textAlign: 'center' }}>
            Submission options
          </Heading>
          <Text variant="smallCaps" sx={{ mt: 3 }}>
            Standard
          </Text>
          <Text sx={{ mt: 3, color: 'onSecondary' }}>
            Submit your vote as a standard transaction and sent to the polling contract on Mainnet. You pay
            the gas fee.
          </Text>
          <Button
            onClick={() => {
              submitBallot();
              onSubmit();
            }}
            data-testid="submit-ballot-button"
            variant="primaryLarge"
            disabled={!ballotCount || !!(transaction && transaction?.status !== 'error')}
            sx={{ mt: 3 }}
          >
            Submit by transaction
          </Button>
          <Text variant="smallCaps" sx={{ mt: 3 }}>
            Gasless
          </Text>
          <Text sx={{ mt: 3, color: 'onSecondary' }}>
            Submit your vote by signing your ballot and sending it to the polling contract on Arbitrum via our
            relayed. The gas fee is covered by Maker.
          </Text>
          <Button
            onClick={() => {
              setStep('method-select');
            }}
            data-testid="submit-ballot-button"
            variant="primaryLarge"
            disabled={!ballotCount || !!(transaction && transaction?.status !== 'error')}
            sx={{ mt: 3 }}
          >
            Submit by gasless signature
          </Button>
          <Button
            onClick={() => {
              setStep('initial');
            }}
            data-testid="submit-ballot-button"
            variant="outline"
            disabled={!ballotCount || !!(transaction && transaction?.status !== 'error')}
            sx={{ mt: 3 }}
          >
            Back
          </Button>
        </Flex>
      );
    default:
      return null;
  }
}
