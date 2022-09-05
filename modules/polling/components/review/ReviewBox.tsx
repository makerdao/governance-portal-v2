import { Box, Button, Card, Divider, Flex, Heading, Text, Spinner } from 'theme-ui';
import { Poll } from 'modules/polling/types';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import { Icon } from '@makerdao/dai-ui-icons';
import ActivePollsBox from './ActivePollsBox';
import { useContext, useState } from 'react';
import { BallotContext } from '../../context/BallotContext';
import LocalIcon from 'modules/app/components/Icon';
import CommentCount from 'modules/comments/components/CommentCount';
import StackLayout from 'modules/app/components/layout/layouts/Stack';
import { ExternalLink } from 'modules/app/components/ExternalLink';
import { ViewMore } from 'modules/home/components/ViewMore';
import TxIndicators from 'modules/app/components/TxIndicators';
import { getBlockExplorerName } from 'modules/web3/constants/networks';
import { getEtherscanLink } from 'modules/web3/helpers/getEtherscanLink';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import { InternalLink } from 'modules/app/components/InternalLink';
import { TXMined } from 'modules/web3/types/transaction';
import logger from 'lib/logger';
import { toast } from 'react-toastify';

export default function ReviewBox({
  activePolls,
  polls
}: {
  activePolls: Poll[];
  polls: Poll[];
}): JSX.Element {
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.POLLING_REVIEW);
  const {
    ballotStep,
    setStep,
    ballotCount,
    commentsCount,
    signComments,
    commentsSignature,
    transaction,
    submissionMethod,
    setSubmissionMethod,
    submitBallot,
    submitBallotGasless
  } = useContext(BallotContext);
  const { network } = useWeb3();
  const [commentsLoading, setCommentsLoading] = useState(false);
  // TODO: Detect if the current user is using a gnosis safe, and change the UI for comments and signatures
  const isGnosisSafe = false;

  // TODO: Add more async checks to see if it can use gasless. (Hasn't used in the last 10 mins and other requirements TBD)
  const canUseGasless = !isGnosisSafe;
  const canUseComments = !isGnosisSafe;

  // Done on the first step, we decide which is the appropiate selected method
  const onClickSubmitBallot = () => {
    if (canUseGasless) {
      setSubmissionMethod('gasless');
    } else {
      setSubmissionMethod('standard');
    }

    setStep('method-select');
  };

  const handleCommentsStep = async () => {
    setCommentsLoading(true);
    try {
      await signComments();
    } catch (err) {
      toast.error('Something went wrong signing your comments. Please try again.');
      logger.error(`signComments: ${err}`);
    }
    setCommentsLoading(false);
  };

  return (
    <Box>
      {ballotStep === 'initial' && (
        <ActivePollsBox polls={polls} activePolls={activePolls}>
          {commentsCount > 0 && canUseComments ? (
            <Box p={3}>
              <StackLayout gap={2}>
                <Button
                  onClick={handleCommentsStep}
                  variant="primaryOutline"
                  data-testid="sign-comments-button"
                  disabled={!!commentsSignature || commentsLoading}
                  sx={{ width: '100%', mt: 3 }}
                >
                  <Flex sx={{ justifyContent: 'center', alignItems: 'center' }}>
                    {!!commentsSignature && <Icon name="checkmark" color="primary" sx={{ mr: 3 }} />}
                    <Text>1 - Sign comment{commentsCount > 1 ? 's' : ''}</Text>
                    {commentsLoading && <Spinner sx={{ ml: 2 }} size={'16px'} />}
                  </Flex>
                </Button>
                <Button
                  onClick={onClickSubmitBallot}
                  data-testid="submit-ballot-button"
                  variant="primaryLarge"
                  disabled={!ballotCount || !commentsSignature}
                  sx={{ width: '100%' }}
                >
                  2 - Submit Your Ballot ({ballotCount} vote{ballotCount === 1 ? '' : 's'})
                </Button>
              </StackLayout>
            </Box>
          ) : (
            <Flex p={3} sx={{ flexDirection: 'column', width: '100%', m: '0' }}>
              <Button
                onClick={onClickSubmitBallot}
                data-testid="submit-ballot-button"
                variant="primaryLarge"
                disabled={!ballotCount || ballotStep !== 'initial'}
                sx={{ width: '100%' }}
              >
                Submit Your Ballot ({ballotCount} vote{ballotCount === 1 ? '' : 's'})
              </Button>
            </Flex>
          )}
          <Box>
            <Flex sx={{ alignItems: 'center', justifyContent: 'center', mb: 3 }}>
              <LocalIcon name="sparkles" color="primary" size={3} />{' '}
              <Text sx={{ ml: 2 }}>Poll voting is now free!</Text>
            </Flex>
          </Box>
        </ActivePollsBox>
      )}

      {ballotStep === 'method-select' && (
        <Card variant="compact" p={0}>
          {submissionMethod === 'gasless' && (
            <Box>
              <Box p={3}>
                <Text sx={{ fontWeight: 'semiBold' }} as="p">
                  Gasless voting on Arbitrum
                </Text>
                <Text sx={{ mt: 2 }}>
                  Submit your vote by signing your ballot and sending it to the polling contract on Arbitrum
                  via our relayer.
                </Text>

                <Flex sx={{ alignItems: 'center', mt: 3 }}>
                  <Box sx={{ pt: '3px', mr: 1 }}>
                    <Icon name="info" color="textSecondary" size={14} />
                  </Box>
                  <Text sx={{ fontSize: 1, color: 'textSecondary' }}>
                    You don&apos;t need to change network.
                  </Text>
                </Flex>
                <Button
                  onClick={() => {
                    submitBallotGasless();
                  }}
                  variant="primaryLarge"
                  disabled={!ballotCount || !!(transaction && transaction?.status !== 'error')}
                  sx={{ mt: 3, width: '100%' }}
                >
                  Proceed with Gasless submission
                </Button>
                <Box>
                  <Flex sx={{ alignItems: 'center', justifyContent: 'center', mt: 3 }}>
                    <LocalIcon name="sparkles" color="primary" size={3} />
                    <Text sx={{ ml: 2 }}>The gas fee is covered by Maker.</Text>
                  </Flex>
                  <Box>
                    <ExternalLink title="View on etherscan" href={'vote.makerdao.com'}>
                      <Text as="p" sx={{ fontSize: [1, 3], textAlign: 'center' }}>
                        Learn more
                        <Icon ml={2} name="arrowTopRight" size={2} />
                      </Text>
                    </ExternalLink>
                  </Box>
                </Box>
              </Box>

              <Divider />

              <Box p={3}>
                <Button
                  onClick={() => {
                    setSubmissionMethod('standard');
                  }}
                  variant="primaryOutline"
                  data-testid="switch-to-standar-votting-button"
                  sx={{ width: '100%' }}
                >
                  <Flex sx={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Text>Switch to standard voting</Text>
                  </Flex>
                </Button>
              </Box>
            </Box>
          )}
          {submissionMethod === 'standard' && (
            <Box>
              <Box p={3}>
                <Text sx={{ fontWeight: 'semiBold' }} as="p">
                  Standard voting on Mainnet
                </Text>
                <Text sx={{ mt: 2 }}>
                  Submit your vote as a standard transaction and sending it to the polling contract on
                  Mainnet.
                </Text>

                <Flex sx={{ alignItems: 'center', mt: 3 }}>
                  <Box sx={{ pt: '3px', mr: 1 }}>
                    <Icon name="info" color="textSecondary" size={14} />
                  </Box>
                  <Text sx={{ fontSize: 1, color: 'textSecondary' }}>
                    This has been the standard way of voting.
                  </Text>
                </Flex>
                <Button
                  onClick={() => {
                    submitBallot();
                  }}
                  variant="primaryLarge"
                  disabled={!ballotCount || !!(transaction && transaction?.status !== 'error')}
                  sx={{ mt: 3, width: '100%' }}
                >
                  Proceed with Standard submission
                </Button>
                <Box>
                  <Flex sx={{ alignItems: 'center', justifyContent: 'center', mt: 3 }}>
                    <Text>You pay the gas fee.</Text>
                  </Flex>
                  <Box>
                    <ExternalLink title="View on etherscan" href={'vote.makerdao.com'}>
                      <Text as="p" sx={{ fontSize: [1, 3], textAlign: 'center' }}>
                        Learn more
                        <Icon ml={2} name="arrowTopRight" size={2} />
                      </Text>
                    </ExternalLink>
                  </Box>
                </Box>
              </Box>

              <Divider />

              <Box p={3}>
                <Button
                  onClick={() => {
                    setSubmissionMethod('gasless');
                  }}
                  variant="primaryOutline"
                  disabled={!canUseGasless}
                  data-testid="switch-to-gasless-votting-button"
                  sx={{ width: '100%' }}
                >
                  <Flex sx={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Text>Switch to gasless voting</Text>
                  </Flex>
                </Button>
              </Box>
            </Box>
          )}
        </Card>
      )}

      {ballotStep === 'submitting' && (
        <Card variant="compact" p={3}>
          <Flex sx={{ alignItems: 'center', justifyContent: 'center', mt: 4 }}>
            <TxIndicators.Pending sx={{ width: 6 }} />
          </Flex>
          <Text
            mt={3}
            as="p"
            sx={{ textAlign: 'center', fontSize: 16, color: 'secondaryEmphasis', fontWeight: '500' }}
          >
            Please use your wallet to sign your {submissionMethod === 'gasless' ? 'ballot' : 'transaction'}
          </Text>
          <Flex sx={{ justifyContent: 'center' }}>
            <Button
              mt={3}
              mb={4}
              onClick={() => {
                setStep('method-select');
              }}
              variant="textual"
              sx={{ color: 'secondaryEmphasis', textAlign: 'center', fontSize: 12 }}
            >
              Cancel vote submission
            </Button>
          </Flex>
        </Card>
      )}

      {ballotStep === 'awaiting-relayer' && (
        <Card variant="compact" p={3}>
          <Flex sx={{ alignItems: 'center', justifyContent: 'center' }}>
            <TxIndicators.Pending sx={{ width: 6 }} />
          </Flex>
          <Text
            as="p"
            sx={{ textAlign: 'center', fontSize: 16, color: 'secondaryEmphasis', fontWeight: '500', mt: 3 }}
          >
            Sending Ballot to Relayer
          </Text>
        </Card>
      )}

      {ballotStep === 'tx-pending' && (
        <Card variant="compact" p={3}>
          <Flex sx={{ alignItems: 'center', justifyContent: 'center' }}>
            <TxIndicators.Pending sx={{ width: 6 }} />
          </Flex>
          <Text
            as="p"
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
        </Card>
      )}

      {ballotStep === 'tx-error' && (
        <Card variant="compact" p={3}>
          <Flex sx={{ alignItems: 'center', justifyContent: 'center', mt: 4 }}>
            <TxIndicators.Failed sx={{ width: 6 }} />
          </Flex>
          <Text
            mt={3}
            as="p"
            sx={{ textAlign: 'center', fontSize: 16, color: 'secondaryEmphasis', fontWeight: '500' }}
          >
            Transaction Failed.
          </Text>
          <Text mt={3} as="p" sx={{ textAlign: 'center', fontSize: 14, color: 'secondaryEmphasis' }}>
            Something went wrong with your transaction. Please try again.
          </Text>
          <Flex sx={{ justifyContent: 'center' }}>
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
                onClick={() => setStep('method-select')}
              >
                Go back
              </Button>
            </InternalLink>
          </Flex>
        </Card>
      )}
    </Box>
  );
}
