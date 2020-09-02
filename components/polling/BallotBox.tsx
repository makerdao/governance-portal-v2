import { useRouter } from 'next/router';
import { Card, Heading, Box, Flex, Button, Text, Spinner, Link as ExternalLink, Divider } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import shallow from 'zustand/shallow';
import { SupportedNetworks } from '../../lib/constants';
import { getNetwork } from '../../lib/maker';
import Poll from '../../types/poll';
import Ballot from '../../types/ballot';
import useBallotStore from '../../stores/ballot';
import useTransactionStore, { transactionsSelectors } from '../../stores/transactions';
import { getEtherscanLink } from '../../lib/utils';
import VotingWeight from './VotingWeight';
import PollBar from './PollBar';

type Props = { ballot: Ballot; activePolls: Poll[]; network: SupportedNetworks; polls: Poll[] };
export default function ({ ballot, activePolls, network, polls }: Props): JSX.Element {
  const [voteTxId, clearTx] = useBallotStore(state => [state.txId, state.clearTx], shallow);
  const transaction = useTransactionStore(
    state => (voteTxId ? transactionsSelectors.getTransaction(state, voteTxId) : null),
    shallow
  );
  const ballotLength = Object.keys(ballot).length;
  const router = useRouter();
  const startReview = () => {
    clearTx();
    router.push({ pathname: '/polling/review', query: network });
  };

  return (
    <Box>
      <Heading mb={3} mt={4} variant="microHeading">
        Your Ballot
      </Heading>
      {transaction?.hash && transaction.status === 'pending' ? (
        <Card variant="compact" p={[0, 0]} sx={{ justifyContent: 'center' }}>
          <Flex sx={{ justifyContent: 'center', flexDirection: 'column' }}>
            <Spinner size={48} mt={4} sx={{ color: 'notice', alignSelf: 'center' }} />
            <Text
              mt={3}
              px={4}
              sx={{ textAlign: 'center', fontSize: 16, color: 'secondaryEmphasis', fontWeight: '500' }}
            >
              Transaction Sent. Vote{ballotLength === 1 ? '' : 's'} pending.
            </Text>
            <ExternalLink
              target="_blank"
              href={getEtherscanLink(getNetwork(), transaction.hash, 'transaction')}
              sx={{ p: 0 }}
            >
              <Text mt={3} px={4} mb={4} sx={{ textAlign: 'center', fontSize: 14, color: 'accentBlue' }}>
                View on Etherscan
                <Icon name="arrowTopRight" pt={2} color="accentBlue" />
              </Text>
            </ExternalLink>
          </Flex>
        </Card>
      ) : (
        <Card variant="compact" p={[0, 0]}>
          <PollBar polls={polls} activePolls={activePolls} ballot={ballot} />

          <Divider />
          <VotingWeight sx={{ borderBottom: '1px solid secondaryMuted', px: 3, py: 2 }} />
          <Divider />
          <Flex p={3} sx={{ flexDirection: 'column' }}>
            <Button onClick={startReview} variant="primary" disabled={!ballotLength} sx={{ width: '100%' }}>
              Review & Submit Your Ballot
            </Button>
          </Flex>
        </Card>
      )}
    </Box>
  );
}
