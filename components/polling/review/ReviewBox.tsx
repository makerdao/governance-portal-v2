import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, Box, Flex, Button, Text, Link as ExternalLink, Divider } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import shallow from 'zustand/shallow';

import { useBreakpointIndex } from '@theme-ui/match-media';
import { getEtherscanLink } from '../../../lib/utils';
import { getNetwork } from '../../../lib/maker';
import Poll from '../../../types/poll';
import { TXMined } from '../../../types/transaction';
import useBallotStore from '../../../stores/ballot';
import useTransactionStore, { transactionsSelectors } from '../../../stores/transactions';
import VotingWeight from '../VotingWeight';
import TxIndicators from '../../TxIndicators';
import PollBar from '../PollBar';

export default function ({
  activePolls,
  polls,
  ...props
}: {
  activePolls: Poll[];
  polls: Poll[];
}): JSX.Element {
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

  const ReviewBoxCard = props => (
    <Card variant="compact" p={[0, 0]}>
      <Flex
        sx={{
          justifyContent: ['center'],
          flexDirection: 'column'
        }}
      >
        {props.children}
      </Flex>
    </Card>
  );

  const Default = props => (
    <ReviewBoxCard {...props}>
      <PollBar ballot={ballot} polls={polls} activePolls={activePolls} />
      <Divider />
      <VotingWeight sx={{ px: 3, py: [1, 2] }} />
      <Divider />
      {bpi > 2 && (
        <Flex p={3} sx={{ flexDirection: 'column', width: '100%' }}>
          <Button
            onClick={submitBallot}
            variant="primary"
            disabled={!ballotLength || !!voteTxId}
            sx={{ width: '100%' }}
          >
            Submit Your Ballot ({ballotLength}) Votes
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
        Please use your [hardware, metamask, etc] wallet to sign this transaction.
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
    <ReviewBoxCard {...props}>
      <Flex sx={{ alignItems: 'center', justifyContent: 'center', mt: 4 }}>
        <TxIndicators.Success sx={{ width: 6 }} />
      </Flex>
      <Text
        mt={3}
        px={4}
        sx={{ textAlign: 'center', fontSize: 16, color: 'secondaryEmphasis', fontWeight: '500' }}
      >
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
        <Text sx={{ px: 3, textAlign: 'center', fontSize: 14, color: 'accentBlue' }}>
          View on Etherscan
          <Icon name="arrowTopRight" pt={2} color="accentBlue" />
        </Text>
      </ExternalLink>
      <Link href={{ pathname: '/polling', query: { network: getNetwork() } }}>
        <Button
          mt={3}
          mb={4}
          variant="outline"
          sx={{ borderColor: 'primary', color: 'primary' }}
          onClick={clearTx}
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
        <Button onClick={submitBallot} variant="primary" disabled={!ballotLength} sx={{ width: '100%' }}>
          {`Submit Your Ballot (${ballotLength} Votes)`}
        </Button>
      </Flex>
      <Link href={{ pathname: '/polling', query: { network: getNetwork() } }}>
        <Button
          mt={1}
          mb={4}
          variant="textual"
          sx={{ borderColor: 'primary', color: 'secondaryEmphasis' }}
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
  }, [isInitialized, isPendingOrMined, hasFailed]);

  return <Box {...props}>{view}</Box>;
}
