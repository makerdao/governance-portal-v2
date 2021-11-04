/** @jsx jsx */
import { useMemo } from 'react';
import Link from 'next/link';
import { Card, Box, Flex, Button, Text, Link as ExternalLink, Divider, jsx } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import shallow from 'zustand/shallow';
import { useBreakpointIndex } from '@theme-ui/match-media';

import { getEtherscanLink } from 'lib/utils';
import { getNetwork } from 'lib/maker';
import { Poll } from 'modules/polling/types';
import { TXMined } from 'types/transaction';
import useBallotStore from 'stores/ballot';
import useTransactionStore, { transactionsSelectors } from 'stores/transactions';
import VotingWeight from '../VotingWeight';
import TxIndicators from 'modules/app/components/TxIndicators';
import PollBar from '../PollBar';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';

const ReviewBoxCard = ({ children, ...props }) => (
  <Card variant="compact" p={[0, 0]} {...props}>
    <Flex sx={{ justifyContent: ['center'], flexDirection: 'column' }}>{children}</Flex>
  </Card>
);

export default function ReviewBox({
  activePolls,
  polls,
  ...props
}: {
  activePolls: Poll[];
  polls: Poll[];
}): JSX.Element {
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.POLLING_REVIEW);
  const { clearTx, voteTxId, ballot, submitBallot } = useBallotStore(
    state => ({
      clearTx: state.clearTx,
      voteTxId: state.txId,
      ballot: state.ballot,
      submitBallot: state.submitBallot
    }),
    shallow
  );

  const transaction = useTransactionStore(
    state => (voteTxId ? transactionsSelectors.getTransaction(state, voteTxId) : null),
    shallow
  );

  const bpi = useBreakpointIndex();
  const ballotLength = Object.keys(ballot).length;

  const Default = props => (
    <ReviewBoxCard {...props}>
      <PollBar ballot={ballot} polls={polls} activePolls={activePolls} />
      <Divider />
      <VotingWeight sx={{ px: 3, py: [2, 2], mb: 1 }} />
      <Divider m={0} sx={{ display: ['none', 'block'] }} />
      {bpi > 2 && (
        <Flex p={3} sx={{ flexDirection: 'column', width: '100%', m: '0' }}>
          <Button
            onClick={() => {
              trackButtonClick('submitBallot');
              submitBallot();
            }}
            variant="primaryLarge"
            disabled={!ballotLength || !!voteTxId}
            sx={{ width: '100%' }}
          >
            Submit Your Ballot
          </Button>
        </Flex>
      )}
    </ReviewBoxCard>
  );

  const Initializing = props => (
    <ReviewBoxCard {...props}>
      <Flex sx={{ alignItems: 'center', justifyContent: 'center', mt: 4 }}>
        <TxIndicators.Pending sx={{ width: 6 }} />
      </Flex>
      <Text
        mt={3}
        px={4}
        sx={{ textAlign: 'center', fontSize: 16, color: 'secondaryEmphasis', fontWeight: '500' }}
      >
        Please use your wallet to sign this transaction.
      </Text>
      <Button
        mt={3}
        mb={4}
        onClick={clearTx}
        variant="textual"
        sx={{ color: 'secondaryEmphasis', fontSize: 12 }}
      >
        Cancel vote submission
      </Button>
    </ReviewBoxCard>
  );

  const Sent = props => (
    <ReviewBoxCard {...props} sx={{ p: [3, 4] }}>
      <Flex sx={{ alignItems: 'center', justifyContent: 'center' }}>
        <TxIndicators.Success sx={{ width: 6 }} />
      </Flex>
      <Text px={4} sx={{ textAlign: 'center', fontSize: 16, color: 'secondaryEmphasis', fontWeight: '500' }}>
        Transaction Sent!
      </Text>
      <Text sx={{ p: 3, pb: 1, textAlign: 'center', fontSize: 14, color: 'secondaryEmphasis' }}>
        Votes will update once the blockchain has confirmed the transaction.
      </Text>
      <ExternalLink
        target="_blank"
        href={getEtherscanLink(getNetwork(), (transaction as TXMined).hash, 'transaction')}
        sx={{ p: 0 }}
      >
        <Text as="p" sx={{ textAlign: 'center', fontSize: 14, color: 'accentBlue' }}>
          View on Etherscan
          <Icon name="arrowTopRight" pt={2} color="accentBlue" />
        </Text>
      </ExternalLink>
      <Link href={{ pathname: '/polling', query: { network: getNetwork() } }}>
        <Button mt={3} variant="outline" sx={{ borderColor: 'primary', color: 'primary' }} onClick={clearTx}>
          Back To All Polls
        </Button>
      </Link>
    </ReviewBoxCard>
  );

  const Error = props => (
    <ReviewBoxCard {...props}>
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
      <Flex p={3} sx={{ flexDirection: 'column' }}>
        <Button
          onClick={() => {
            trackButtonClick('submitBallot');
            submitBallot();
          }}
          variant="primaryLarge"
          disabled={!ballotLength}
          sx={{ width: '100%' }}
        >
          Submit Your Ballot
        </Button>
      </Flex>
      <Link href={{ pathname: '/polling/review', query: { network: getNetwork() } }}>
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
          onClick={clearTx}
        >
          Go back
        </Button>
      </Link>
    </ReviewBoxCard>
  );

  const isInitialized = transaction?.status === 'initialized';
  const isPendingOrMined = transaction?.status === 'pending' || transaction?.status === 'mined';
  const hasFailed = transaction?.status === 'error';

  const view = useMemo(() => {
    if (isInitialized) return <Initializing />;
    if (isPendingOrMined) return <Sent />;
    if (hasFailed) return <Error />;
    return <Default />;
  }, [isInitialized, isPendingOrMined, hasFailed, bpi]);

  return <Box {...props}>{view}</Box>;
}
