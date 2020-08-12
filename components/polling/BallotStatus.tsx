import { useRouter } from 'next/router';
import { Text, Button, Spinner } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import shallow from 'zustand/shallow';

import useTransactionStore, { transactionsSelectors } from '../../stores/transactions';
import TX from '../../types/transaction';
import useBallotStore from '../../stores/ballot';
import { getNetwork } from '../../lib/maker';

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
      {transaction?.status === 'pending' && (
        <Spinner
          size={16}
          sx={{
            color: 'mutedOrange',
            alignSelf: 'center',
            display: transaction && transaction.status === 'pending' ? null : 'none',
            mr: 2
          }}
        />
      )}
      <StatusText {...{ transaction, ballotLength }} />
    </Button>
  );
};

const StatusText = ({
  transaction,
  ballotLength
}: {
  transaction: TX | null;
  ballotLength: number;
}): JSX.Element => {
  const DEFAULT_TEXT = `Your Ballot: ${ballotLength} ${ballotLength === 1 ? 'vote' : 'votes'}`;
  const text =
    transaction === null
      ? DEFAULT_TEXT
      : transaction.status === 'pending'
      ? 'Vote Pending'
      : transaction.status === 'mined'
      ? 'Vote Sent Successfully'
      : DEFAULT_TEXT;

  const DEFAULT_COLOR = 'white';
  const color =
    transaction === null
      ? ballotLength === 0
        ? 'textMuted'
        : DEFAULT_COLOR
      : transaction.status === 'pending'
      ? 'mutedOrange'
      : transaction.status === 'mined'
      ? 'primary'
      : DEFAULT_COLOR;

  return (
    <Text
      sx={{
        color,
        fontWeight: ballotLength === 0 ? 'normal' : '600'
      }}
    >
      {text || DEFAULT_TEXT}
    </Text>
  );
};

export default BallotStatus;
