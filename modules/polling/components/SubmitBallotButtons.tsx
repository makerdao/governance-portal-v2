import { Icon } from '@makerdao/dai-ui-icons';
import { Box, Flex, Button, Text, Heading } from 'theme-ui';
import { useContext } from 'react';
import { BallotContext } from '../context/BallotContext';

export function SubmitBallotsButtons({ onSubmit }: { onSubmit: () => void }): React.ReactElement | null {
  const {
    signComments,
    transaction,
    submitBallot,
    submitBallotGasless,
    ballotCount,
    commentsCount,
    commentsSignature,
    setStep,
    ballotStep,
    handleCommentsStep,
    submissionMethod
  } = useContext(BallotContext);

  switch (ballotStep) {
    case 'initial':
      return (
        <Flex p={3} sx={{ flexDirection: 'column', width: '100%', m: '0' }}>
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
              handleCommentsStep('standard');
              // submitBallot();
              // onSubmit();
            }}
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
            onClick={() => handleCommentsStep('gasless')}
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
            variant="outline"
            disabled={!ballotCount || !!(transaction && transaction?.status !== 'error')}
            sx={{ mt: 3 }}
          >
            Back
          </Button>
        </Flex>
      );
    case 'sign-comments':
      return (
        <Flex sx={{ flexDirection: 'column', p: 3 }}>
          <Heading variant="microHeading" sx={{ mt: 3, textAlign: 'center' }}>
            Poll Comments
          </Heading>
          <Text sx={{ mt: 3, color: 'onSecondary' }}>
            Sign your comments with your wallet in order to validate them. They will be stored off-chain but
            displayed along with your vote.
          </Text>
          <Button
            onClick={() => {
              // signComments();
              setStep('confirm');
            }}
            variant="primaryOutline"
            data-testid="sign-comments-button"
            disabled={
              !ballotCount || !!(transaction && transaction?.status !== 'error') || !!commentsSignature
            }
            sx={{ width: '100%', mt: 3 }}
          >
            <Flex sx={{ justifyContent: 'center', alignItems: 'center' }}>
              {!!commentsSignature && <Icon name="checkmark" color="primary" sx={{ mr: 3 }} />}
              <Text>Sign comments</Text>
            </Flex>
          </Button>
        </Flex>
      );
    case 'confirm':
      return (
        <Flex sx={{ flexDirection: 'column', p: 3 }}>
          <Heading variant="microHeading" sx={{ mt: 3, textAlign: 'center' }}>
            Confirmation
          </Heading>
          <Text variant="smallCaps" sx={{ mt: 3 }}>
            Method
          </Text>
          <Text sx={{ mt: 3, color: 'onSecondary' }}>{submissionMethod}</Text>
          {submissionMethod === 'gasless' ? (
            <Button
              onClick={submitBallotGasless}
              variant="primaryLarge"
              disabled={!ballotCount || !!(transaction && transaction?.status !== 'error')}
              sx={{ mt: 3 }}
            >
              Sign &amp; submit ballot
            </Button>
          ) : (
            <Button
              onClick={() => null}
              variant="primaryLarge"
              disabled={!ballotCount || !!(transaction && transaction?.status !== 'error')}
              sx={{ mt: 3 }}
            >
              Submit ballot
            </Button>
          )}
        </Flex>
      );
    default:
      return null;
  }
}
