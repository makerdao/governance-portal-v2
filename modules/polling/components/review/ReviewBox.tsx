import { useContext, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, Box, Flex, Button, Text, Link as ExternalLink, Divider } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { useBreakpointIndex } from '@theme-ui/match-media';

import { getEtherscanLink } from 'modules/web3/helpers/getEtherscanLink';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { Poll } from 'modules/polling/types';
import { TXMined } from 'modules/web3/types/transaction';
import VotingWeight from '../VotingWeight';
import TxIndicators from 'modules/app/components/TxIndicators';
import PollBar from '../PollBar';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import { SubmitBallotsButtons } from '../SubmitBallotButtons';
import { BallotContext } from 'modules/polling/context/BallotContext';

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

  const { transaction, clearTransaction, ballot, commentsSignature } = useContext(BallotContext);

  const { network } = useActiveWeb3React();

  const bpi = useBreakpointIndex();

  const Default = props => (
    <ReviewBoxCard {...props}>
      <PollBar polls={polls} activePolls={activePolls} />
      <Divider />
      <Box sx={{ px: 3, py: [2, 2], mb: 1 }}>
        <VotingWeight />
      </Box>
      <Divider m={0} sx={{ display: ['none', 'block'] }} />
      {bpi > 2 && (
        <SubmitBallotsButtons
          onSubmit={() => {
            trackButtonClick('submitBallot');
          }}
        />
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
        onClick={clearTransaction}
        variant="textual"
        sx={{ color: 'secondaryEmphasis', fontSize: 12 }}
      >
        Cancel vote submission
      </Button>
    </ReviewBoxCard>
  );

  const Pending = props => (
    <ReviewBoxCard {...props} sx={{ p: [3, 4] }}>
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
        target="_blank"
        href={getEtherscanLink(network, (transaction as TXMined).hash, 'transaction')}
        sx={{ p: 0, mt: 3 }}
      >
        <Text as="p" sx={{ textAlign: 'center', fontSize: 14, color: 'accentBlue' }}>
          View on Etherscan
          <Icon name="arrowTopRight" pt={2} color="accentBlue" />
        </Text>
      </ExternalLink>
    </ReviewBoxCard>
  );

  const Mined = props => (
    <ReviewBoxCard {...props} sx={{ p: [3, 4] }}>
      <Flex sx={{ alignItems: 'center', justifyContent: 'center' }}>
        <TxIndicators.Success sx={{ width: 6 }} />
      </Flex>
      <Text px={4} sx={{ textAlign: 'center', fontSize: 16, color: 'secondaryEmphasis', fontWeight: '500' }}>
        Transaction Sent!
      </Text>
      <Text sx={{ p: 3, pb: 1, textAlign: 'center', fontSize: 14, color: 'secondaryEmphasis' }}>
        Votes will update once the transaction is confirmed.
      </Text>
      <ExternalLink
        target="_blank"
        href={getEtherscanLink(network, (transaction as TXMined).hash, 'transaction')}
        sx={{ p: 0 }}
      >
        <Text as="p" sx={{ textAlign: 'center', fontSize: 14, color: 'accentBlue' }}>
          View on Etherscan
          <Icon name="arrowTopRight" pt={2} color="accentBlue" />
        </Text>
      </ExternalLink>
      <Link href={{ pathname: '/polling' }}>
        <Button
          mt={3}
          variant="outline"
          sx={{ borderColor: 'primary', color: 'primary' }}
          onClick={clearTransaction}
        >
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
        <SubmitBallotsButtons
          onSubmit={() => {
            trackButtonClick('submitBallot');
          }}
        />
      </Flex>
      <Link href={{ pathname: '/polling/review' }}>
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
          onClick={clearTransaction}
        >
          Go back
        </Button>
      </Link>
    </ReviewBoxCard>
  );

  const [transactionStatus, setTransactionStatus] = useState('default');

  useEffect(() => {
    setTransactionStatus(transaction?.status || 'default');
  }, [transaction]);

  const view = useMemo(() => {
    if (transactionStatus === 'default') return <Default />;
    if (transactionStatus === 'initialized') return <Initializing />;
    if (transactionStatus === 'pending') return <Pending />;
    if (transactionStatus === 'mined') return <Mined />;
    if (transactionStatus === 'error') return <Error />;
    return <Default />;
  }, [transactionStatus, bpi, commentsSignature, ballot]);
  return <Box {...props}>{view}</Box>;
}
