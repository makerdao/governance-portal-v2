import { useState } from 'react';
import { useRouter } from 'next/router';
import { Card, Heading, Box, Flex, Button, Text } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import useBallotStore from '../../stores/ballot';
import useTransactionStore from '../../stores/transactions';

export default function({ ...props }) {
  const ballotTxId = useBallotStore(state => state.ballotTxId);
  const transaction = useTransactionStore(state => state.getTransaction(ballotTxId));
  const ballot = props.ballot;
  const submitBallot = props.submitBallot;
  const activePolls = props.activePolls;
  const ballotLength = () => {
    return Object.keys(ballot).length;
  };
  const [ballotState, setBallotState] = useState(0);
  const [votingWeightTotal, setVotingWeighTotal] = useState(0);
  const Default = () => (
    <Card variant="compact" p={[0, 0]}>
      <Box p={3} sx={{ borderBottom: '1px solid #D4D9E1' }}>
        <Text sx={{ color: 'onSurface', fontSize: 16, fontWeight: '500' }}>
          {`${ballotLength()} of ${activePolls.length} available polls added to ballot`}
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
          {activePolls.map((pollId, index) => (
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
                backgroundColor: index < ballotLength() ? 'primary' : null
              }}
            />
          ))}
        </Flex>
      </Box>
      <Flex
        p={3}
        sx={{
          borderBottom: '1px solid #D4D9E1',
          justifyContent: 'space-between',
          flexDirection: 'row'
        }}
      >
        <Flex sx={{ flexDirection: 'row' }}>
          <Text color="onSurface">Voting weight for all polls</Text>
          <Icon name="question" ml={1} mt={1} sx={{ paddingTop: '3px' }} />
        </Flex>
        <Text>{`${votingWeightTotal.toFixed(2)} MKR`}</Text>
      </Flex>
      <Flex p={3} sx={{ flexDirection: 'column' }}>
        {/* <Flex pb={3} sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
          <Text color="onSurface">Estimated Gas Cost</Text>
          <Text>{`Gas Cost`}</Text>
        </Flex>
        <Flex pb={4} sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
          <Text color="onSurface">Estimated Confirmation Time</Text>
          <Text>{`Confirm Time`}</Text>
        </Flex>  */}
        <Flex p={3} sx={{ flexDirection: 'column' }}>
          <Button
            onClick={submitBallot}
            variant="primary"
            disabled={!ballotLength()}
            sx={{ width: '100%' }}
          >
            {`Submit Your Ballot (${ballotLength()} Votes)`}
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
  const steps = [
    // props => <DeployProxy {...props} />,
    // props => <DepositDai {...props} />,
    // props => <ConfirmRedeem {...props} />
  ];

  const View = () => {
    switch (transaction && transaction.status) {
      case 0:
        return <Default />;
      // Is Init
      case 'initialized':
        return <Box>Initialized</Box>;
      // Is Sent
      case 'pending':
        return <Box>Sent</Box>;
      // Is Completed
      case 'mined':
        <Box>Mined</Box>;
      // Is Failed
      case 'error':
        <Box>Failed</Box>;

      default:
        return <Default />;
        break;
    }
  };

  return (
    <Box>
      <Heading mb={3} as="h4">
        Submit Ballot
      </Heading>
      <View />
    </Box>
  );
}
