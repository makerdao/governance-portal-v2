import { useRouter } from 'next/router';
import { Text, Button, Spinner } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import shallow from 'zustand/shallow';

import useTransactionStore, { transactionsSelectors } from '../stores/transactions';
import TX from '../types/transaction';
import useBallotStore from '../stores/ballot';
import { getNetwork } from '../lib/maker';

function renderButtonText(transaction: TX | null, ballotLength: number): string {
  const defaultText = `Your Ballot: ${ballotLength} ${ballotLength === 1 ? 'vote' : 'votes'}`;
  if (!transaction) return defaultText;
  return (
    {
      pending: 'Vote Pending',
      mined: 'Vote Sent Successfully'
    }[transaction.status] || defaultText
  );
}

const BallotStatus = (props: any): JSX.Element => {
  const [ballot, txId] = useBallotStore(state => [state.ballot, state.txId]);
  const transaction = useTransactionStore(
    state => (txId ? transactionsSelectors.getTransaction(state, txId) : null),
    shallow
  );
  const ballotLength = Object.keys(ballot).length;
  const router = useRouter();
  const network = getNetwork();

  return (
    <Button
      variant={ballotLength && !transaction ? 'primary' : 'outline'}
      sx={{
        borderRadius: 'round',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        border: transaction ? '1px solid mutedOrange' : ballotLength ? null : '1px solid secondaryMuted',
        display: 'flex'
      }}
      onClick={() => {
        if (transaction || !ballotLength) return;
        router.push({ pathname: '/polling/review', query: network });
      }}
      {...props}
    >
      <Icon
        name="ballot"
        size={3}
        sx={{ color: ballotLength ? 'white' : 'textMuted', display: transaction ? 'none' : null }}
      />
      <Spinner
        size={16}
        sx={{
          color: 'mutedOrange',
          alignSelf: 'center',
          display: transaction && transaction.status === 'pending' ? null : 'none'
        }}
      />
      <Text
        sx={{
          color: transaction ? 'mutedOrange' : ballotLength ? 'white' : 'textMuted',
          fontWeight: ballotLength ? '600' : 'normal',
          ml: 2
        }}
      >
        {renderButtonText(transaction, ballotLength)}
      </Text>
    </Button>
  );
};

export default BallotStatus;
