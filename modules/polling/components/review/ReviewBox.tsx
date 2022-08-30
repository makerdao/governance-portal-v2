import { useContext, useEffect, useMemo, useState } from 'react';
import { Card, Box, Flex, Button, Text } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { getEtherscanLink } from 'modules/web3/helpers/getEtherscanLink';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import { Poll } from 'modules/polling/types';
import { TXMined } from 'modules/web3/types/transaction';
import TxIndicators from 'modules/app/components/TxIndicators';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import { SubmitBallotsButtons } from '../SubmitBallotButtons';
import { BallotContext } from 'modules/polling/context/BallotContext';
import ActivePollsBox from './ActivePollsBox';
import { ExternalLink } from 'modules/app/components/ExternalLink';
import { InternalLink } from 'modules/app/components/InternalLink';

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

  const { network } = useWeb3();

  const bpi = useBreakpointIndex();

  const Default = props => (
    <ActivePollsBox polls={polls} activePolls={activePolls} {...props}>
      <SubmitBallotsButtons
        onSubmit={() => {
          trackButtonClick('submitBallot');
        }}
      />
    </ActivePollsBox>
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
        href={getEtherscanLink(network, (transaction as TXMined).hash, 'transaction')}
        styles={{ p: 0, mt: 3 }}
        title="View on etherscan"
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
        href={getEtherscanLink(network, (transaction as TXMined).hash, 'transaction')}
        styles={{ p: 0 }}
        title="View on etherscan"
      >
        <Text as="p" sx={{ textAlign: 'center', fontSize: 14, color: 'accentBlue' }}>
          View on Etherscan
          <Icon name="arrowTopRight" pt={2} color="accentBlue" />
        </Text>
      </ExternalLink>
      <InternalLink href={'/polling'} title="View polling page">
        <Button
          mt={3}
          variant="outline"
          sx={{ borderColor: 'primary', color: 'primary', width: '100%' }}
          onClick={clearTransaction}
        >
          Back To All Polls
        </Button>
      </InternalLink>
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
          onClick={clearTransaction}
        >
          Go back
        </Button>
      </InternalLink>
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
