import { Icon } from '@makerdao/dai-ui-icons';
import { Flex, Button, Text, Heading, Close } from 'theme-ui';
import React, { useContext } from 'react';
import { BallotContext } from '../context/BallotContext';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import { fadeIn, slideUp } from 'lib/keyframes';
import { useBreakpointIndex } from '@theme-ui/match-media';
import TxIndicators from 'modules/app/components/TxIndicators';
import { getEtherscanLink } from 'modules/web3/helpers/getEtherscanLink';
import { ExternalLink } from 'modules/app/components/ExternalLink';
import { InternalLink } from 'modules/app/components/InternalLink';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { TXMined } from 'modules/web3/types/transaction';
import { getBlockExplorerName } from 'modules/web3/constants/networks';

export function BallotModals({
  onSubmit
}: {
  onSubmit: () => void;
}): React.ReactElement {
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
    submissionMethod,
    close
  } = useContext(BallotContext);
  const bpi = useBreakpointIndex();

  const { network } = useActiveWeb3React();

  //todo: create separate components for each modal

  const modalContent = () => {
    switch (ballotStep) {
      case 'method-select':
        return (
          <Flex sx={{ flexDirection: 'column', p: 3 }}>
            <Heading variant="microHeading" sx={{ mt: 3, textAlign: 'center' }}>
              Submission options
            </Heading>
            <Heading variant="microHeading" sx={{ mt: 3 }}>
              Standard
            </Heading>
            <Text sx={{ mt: 3, color: 'onSecondary' }}>
              Submit your vote as a standard transaction and send it to the polling contract on Mainnet. You
              pay the gas fee.
            </Text>
            <Button
              onClick={() => {
                handleCommentsStep('standard');
                // onSubmit();
              }}
              variant="primaryLarge"
              disabled={!ballotCount || !!(transaction && transaction?.status !== 'error')}
              sx={{ mt: 3 }}
            >
              Submit by transaction
            </Button>
            <Heading variant="microHeading" sx={{ mt: 3 }}>
              Gasless
            </Heading>
            <Text sx={{ mt: 3, color: 'onSecondary' }}>
              Submit your vote by signing your ballot and sending it to the polling contract on Arbitrum via
              our relayer. The gas fee is covered by Maker.
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
          </Flex>
        );
      case 'sign-comments':
        return (
          <Flex sx={{ flexDirection: 'column', p: 3 }}>
            <Heading variant="microHeading" sx={{ mt: 3, textAlign: 'center' }}>
              Sign Comment{commentsCount > 1 ? 's' : ''}
            </Heading>
            <Text sx={{ mt: 3, color: 'onSecondary' }}>
              Sign your comment{commentsCount > 1 ? 's' : ''} with your wallet in order to validate{' '}
              {commentsCount > 1 ? 'them' : 'it'}. {commentsCount > 1 ? 'They' : 'It'} will be stored
              off-chain but displayed along with your vote.
            </Text>
            <Button
              onClick={() => {
                signComments();
              }}
              variant="primaryOutline"
              data-testid="sign-comments-button"
              disabled={!!commentsSignature}
              sx={{ width: '100%', mt: 3 }}
            >
              <Flex sx={{ justifyContent: 'center', alignItems: 'center' }}>
                {!!commentsSignature && <Icon name="checkmark" color="primary" sx={{ mr: 3 }} />}
                <Text>Sign comment{commentsCount > 1 ? 's' : ''}</Text>
              </Flex>
            </Button>
            <Button
              mt={3}
              variant="smallOutline"
              onClick={() => {
                setStep('method-select');
              }}
            >
              Back
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
                onClick={submitBallot}
                variant="primaryLarge"
                disabled={!ballotCount || !!(transaction && transaction?.status !== 'error')}
                sx={{ mt: 3 }}
              >
                Submit ballot
              </Button>
            )}
          </Flex>
        );
      case 'submitting':
        return (
          <React.Fragment>
            <Flex sx={{ alignItems: 'center', justifyContent: 'center', mt: 4 }}>
              <TxIndicators.Pending sx={{ width: 6 }} />
            </Flex>
            <Text
              mt={3}
              px={4}
              sx={{ textAlign: 'center', fontSize: 16, color: 'secondaryEmphasis', fontWeight: '500' }}
            >
              Please use your wallet to sign your {submissionMethod === 'gasless' ? 'ballot' : 'transaction'}
            </Text>
            <Button
              mt={3}
              mb={4}
              onClick={close}
              variant="textual"
              sx={{ color: 'secondaryEmphasis', fontSize: 12 }}
            >
              Cancel vote submission
            </Button>
          </React.Fragment>
        );
      case 'awaiting-relayer':
        return (
          <React.Fragment>
            <Flex sx={{ alignItems: 'center', justifyContent: 'center' }}>
              <TxIndicators.Pending sx={{ width: 6 }} />
            </Flex>
            <Text
              px={4}
              sx={{ textAlign: 'center', fontSize: 16, color: 'secondaryEmphasis', fontWeight: '500', mt: 3 }}
            >
              Sending Ballot to Relayer
            </Text>
          </React.Fragment>
        );
      case 'tx-pending':
        return (
          <React.Fragment>
            <Flex sx={{ alignItems: 'center', justifyContent: 'center' }}>
              <TxIndicators.Pending sx={{ width: 6 }} />
            </Flex>
            <Text
              px={4}
              sx={{ textAlign: 'center', fontSize: 16, color: 'secondaryEmphasis', fontWeight: '500', mt: 3 }}
            >
              Transaction Pending
            </Text>

            <ExternalLink
              href={getEtherscanLink(
                transaction?.gaslessNetwork ?? network,
                (transaction as TXMined).hash,
                'transaction'
              )}
              styles={{ p: 0, mt: 3 }}
              title="View on block explorer"
            >
              <Text as="p" sx={{ textAlign: 'center', fontSize: 14, color: 'accentBlue' }}>
                View on {getBlockExplorerName(transaction?.gaslessNetwork ?? network)}
                <Icon name="arrowTopRight" pt={2} color="accentBlue" />
              </Text>
            </ExternalLink>
          </React.Fragment>
        );
      case 'tx-error':
        return (
          <React.Fragment>
            <Flex sx={{ alignItems: 'center', justifyContent: 'center', mt: 4 }}>
              <TxIndicators.Failed sx={{ width: 6 }} />
            </Flex>
            <Text
              mt={3}
              px={4}
              sx={{ textAlign: 'center', fontSize: 16, color: 'secondaryEmphasis', fontWeight: '500' }}
            >
              Transaction Failed.
            </Text>
            <Text mt={3} px={4} sx={{ textAlign: 'center', fontSize: 14, color: 'secondaryEmphasis' }}>
              Something went wrong with your transaction. Please try again.
            </Text>
            <InternalLink href={'/polling/review'} title="Back">
              <Button
                pb={3}
                variant="textual"
                sx={{
                  borderColor: 'primary',
                  color: 'secondaryEmphasis',
                  fontSize: 2,
                  width: 'max-content',
                  margin: 'auto'
                }}
                onClick={close}
              >
                Go back
              </Button>
            </InternalLink>
          </React.Fragment>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <DialogOverlay style={{ background: 'hsla(237.4%, 13.8%, 32.7%, 0.9)' }} onDismiss={close}>
        <DialogContent
          aria-label="Polling Vote"
          sx={
            bpi === 0
              ? { variant: 'dialog.mobile', animation: `${slideUp} 350ms ease` }
              : { variant: 'dialog.desktop', animation: `${fadeIn} 350ms ease`, p: 4 }
          }
        >
          <Flex sx={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
            <Close
              aria-label="close"
              sx={{ height: '20px', width: '20px', p: 0, alignSelf: 'flex-end' }}
              onClick={close}
            />
            {modalContent()}
          </Flex>
        </DialogContent>
      </DialogOverlay>
    </div>
  );
}
