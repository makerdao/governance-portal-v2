import { useState } from 'react';
import Link from 'next/link';
import { Card, Heading, Box, Flex, Button, Text, Link as ExternalLink, Spinner } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import shallow from 'zustand/shallow';
import invariant from 'tiny-invariant';

import { useBreakpointIndex } from '@theme-ui/match-media';
import { getEtherscanLink } from '../../lib/utils';
import { getNetwork } from '../../lib/maker';
import Poll from '../../types/poll';
import useBallotStore from '../../stores/ballot';
import useTransactionStore from '../../stores/transactions';

export default function ({ activePolls }: { activePolls: Poll[] }): JSX.Element {
  const { clearTx, voteTxId, ballot, submitBallot } = useBallotStore(
    state => ({
      clearTx: state.clearTx,
      voteTxId: state.txId,
      ballot: state.ballot,
      submitBallot: state.submitBallot
    }),
    shallow
  );

  const transaction = useTransactionStore(state => {
    if (!voteTxId) return null;
    const tx = state.transactions.find(tx => tx.id === voteTxId);
    invariant(tx, `Unable to find tx id ${voteTxId}`);
    return tx;
  }, shallow);

  const bpi = useBreakpointIndex();
  const ballotLength = Object.keys(ballot).length;

  const [votingWeightTotal] = useState(0);

  const ReviewBoxCard = props => (
    <Card variant="compact" p={0}>
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
      <Flex
        p={3}
        sx={{
          borderBottom: '1px solid secondaryMuted',
          justifyContent: 'space-between',
          flexDirection: 'row',
          width: '100%'
        }}
      >
        <Flex sx={{ flexDirection: 'row' }}>
          <Text color="onSurface">Voting weight for all polls</Text>
          <Icon name="question" ml={1} mt={1} sx={{ paddingTop: '3px' }} />
        </Flex>
        <Text>{`${votingWeightTotal.toFixed(2)} MKR`}</Text>
      </Flex>
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
      <Flex sx={{ alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="pencil" size={4} mt={4} />
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
      <Spinner size={48} mt={4} sx={{ color: 'primary' }} />
      <Text
        mt={3}
        px={4}
        sx={{ textAlign: 'center', fontSize: 16, color: 'secondaryEmphasis', fontWeight: '500' }}
      >
        Sending Transaction...
      </Text>
      <Text mt={2} mb={4} sx={{ textAlign: 'center', fontSize: 14, color: 'secondaryEmphasis' }}>
        Submitting ${ballotLength} ${ballotLength === 1 ? 'poll' : 'polls'}
      </Text>
    </ReviewBoxCard>
  );

  const Mined = () => (
    <ReviewBoxCard>
      <Icon name="reviewCheck" size={5} mt={4} />
      <Text
        mt={3}
        px={4}
        sx={{ textAlign: 'center', fontSize: 16, color: 'secondaryEmphasis', fontWeight: '500' }}
      >
        Transaction Sent!
      </Text>
      <Text mt={3} px={4} sx={{ textAlign: 'center', fontSize: 14, color: 'secondaryEmphasis' }}>
        Votes will update once the blockchain has confirmed the transaction.
      </Text>
      {transaction?.hash && (
        <ExternalLink
          target="_blank"
          href={getEtherscanLink(getNetwork(), transaction.hash, 'transaction')}
          sx={{ p: 0 }}
        >
          <Text mt={3} px={4} sx={{ textAlign: 'center', fontSize: 14, color: 'accentBlue' }}>
            View on Etherscan
            <Icon name="arrowTopRight" pt={2} color="accentBlue" />
          </Text>
        </ExternalLink>
      )}
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
      <Icon name="reviewFailed" size={5} mt={4} />
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
    <Box>
      {bpi > 2 && (
        <Heading mb={3} as="h4">
          Submit Ballot
        </Heading>
      )}
      <View />
    </Box>
  );
}
