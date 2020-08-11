import { useState } from 'react';
import Link from 'next/link';
import { Card, Box, Flex, Button, Text, Link as ExternalLink, Spinner } from 'theme-ui';
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

export default function ({ activePolls, ...props }: { activePolls: Poll[] }): JSX.Element {
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
    <Card variant="compact" p={0} sx={{ p: 0 }}>
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

  const Default = () => (
    <ReviewBoxCard>
      <Box p={3} sx={{ borderBottom: '1px solid secondaryMuted', width: '100%' }}>
        <Text sx={{ color: 'onSurface', fontSize: 16, fontWeight: '500' }}>
          {`${ballotLength} of ${activePolls.length} available polls added to ballot`}
        </Text>
        <Flex
          sx={{
            width: '100%',
            height: 2,
            backgroundColor: 'muted',
            mt: 2,
            flexDirection: 'row',
            borderRadius: 'small'
          }}
        >
          {activePolls.map((_, index) => (
            <Box
              key={index}
              backgroundColor="muted"
              sx={{
                flex: 1,
                borderLeft: index === 0 ? null : '1px solid white',
                borderTopLeftRadius: index === 0 ? 'small' : null,
                borderBottomLeftRadius: index === 0 ? 'small' : null,
                borderTopRightRadius: index === activePolls.length - 1 ? 'small' : null,
                borderBottomRightRadius: index === activePolls.length - 1 ? 'small' : null,
                backgroundColor: index < ballotLength ? 'primary' : null
              }}
            />
          ))}
        </Flex>
      </Box>
      <VotingWeight />
      {bpi > 2 && (
        <Flex p={3} sx={{ flexDirection: 'column', width: '100%' }}>
          <Flex p={3} sx={{ flexDirection: 'column' }}>
            <Button
              onClick={submitBallot}
              variant="primary"
              disabled={!ballotLength || !!voteTxId}
              sx={{ width: '100%' }}
            >
              Submit Your Ballot ({ballotLength}) Votes
            </Button>
          </Flex>
        </Flex>
      )}
    </ReviewBoxCard>
  );

  const Initialized = () => (
    <ReviewBoxCard>
      <Flex sx={{ alignItems: 'center', justifyContent: 'center', mt: 4 }}>
        <Icon name="pencil" size={4} />
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

  const Pending = () => (
    <ReviewBoxCard>
      <Flex sx={{ alignItems: 'center', justifyContent: 'center', mt: 4 }}>
        <Spinner size={48} sx={{ color: 'primary' }} />
      </Flex>
      <Text
        mt={3}
        px={4}
        sx={{ textAlign: 'center', fontSize: 16, color: 'secondaryEmphasis', fontWeight: '500' }}
      >
        Sending Transaction...
      </Text>
      <Text mt={2} mb={4} sx={{ textAlign: 'center', fontSize: 14, color: 'secondaryEmphasis' }}>
        Submitting {ballotLength} {ballotLength === 1 ? 'poll' : 'polls'}
      </Text>
    </ReviewBoxCard>
  );

  const Mined = () => (
    <ReviewBoxCard>
      <Flex sx={{ alignItems: 'center', justifyContent: 'center', mt: 4 }}>
        <Icon name="reviewCheck" size={5} />
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

  const Error = () => (
    <ReviewBoxCard>
      <Flex sx={{ alignItems: 'center', justifyContent: 'center', mt: 4 }}>
        <Icon name="reviewFailed" size={5} />
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

  const View = () => {
    switch (transaction?.status || 'default') {
      // Is Init
      case 'initialized':
        return <Initialized />;
      // Is Sent
      case 'pending':
        return <Pending />;
      // Is Completed
      case 'mined':
        return <Mined />;
      // Is Failed
      case 'error':
        return <Error />;
      default:
        return <Default />;
    }
  };

  return (
    <Box {...props}>
      <View />
    </Box>
  );
}
