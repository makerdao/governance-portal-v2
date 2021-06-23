import { useRouter } from 'next/router';
import { Text, Button } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import shallow from 'zustand/shallow';

import useTransactionStore, { transactionsSelectors } from 'stores/transactions';
import {Transaction} from 'types/transaction';
import useBallotStore from 'stores/ballot';
import { getNetwork } from 'lib/maker';

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
      variant={
        ballotLength > 0 && transaction?.status !== 'pending' && transaction?.status !== 'mined'
          ? 'primary'
          : 'outline'
      }
      sx={{
        borderRadius: 'round',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        border: transaction ? '1px solid #D4D9E1' : ballotLength ? null : '1px solid secondaryMuted',
        display: 'flex',
        height: '36px'
      }}
      onClick={() => {
        if (transaction || !ballotLength) return;
        router.push({ pathname: '/polling/review', query: network });
      }}
      {...props}
      disabled={
        ballotLength > 0 && transaction?.status !== 'pending' && transaction?.status !== 'mined'
          ? false
          : true
      }
    >
      <Icon
        name="ballot"
        size={3}
        sx={{
          color:
            ballotLength > 0 && transaction?.status !== 'pending' && transaction?.status !== 'mined'
              ? 'white'
              : 'textMuted',
          mr: 2
        }}
      />
      <StatusText {...{ transaction }} ballotLength={transaction?.status === 'pending' ? 0 : ballotLength} />
    </Button>
  );
};

const StatusText = ({
  transaction,
  ballotLength
}: {
  transaction: Transaction | null;
  ballotLength: number;
}): JSX.Element => {
  const DEFAULT_TEXT = `Your Ballot: ${ballotLength} ${ballotLength === 1 ? 'vote' : 'votes'}`;
  const DEFAULT_COLOR = 'white';
  const color =
    ballotLength > 0 && transaction?.status !== 'pending' && transaction?.status !== 'mined'
      ? DEFAULT_COLOR
      : 'textMuted';

  return (
    <Text
      sx={{
        color,
        fontWeight: ballotLength === 0 ? 'normal' : '600'
      }}
    >
      {DEFAULT_TEXT}
    </Text>
  );
};

export default BallotStatus;
