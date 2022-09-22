import { useRouter } from 'next/router';
import { Text, Button } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { Transaction } from 'modules/web3/types/transaction';
import { useContext } from 'react';
import { BallotContext } from '../context/BallotContext';

const BallotStatus = (props: any): JSX.Element => {
  const { transaction, ballotCount } = useContext(BallotContext);

  const router = useRouter();

  return (
    <Button
      variant={
        ballotCount > 0 && transaction?.status !== 'pending' && transaction?.status !== 'mined'
          ? 'primary'
          : 'outline'
      }
      sx={{
        borderRadius: 'round',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        border: transaction ? '1px solid #D4D9E1' : ballotCount ? null : '1px solid secondaryMuted',
        display: 'flex',
        height: '36px'
      }}
      onClick={() => {
        if (transaction || !ballotCount) return;
        router.push({ pathname: '/polling/review' });
      }}
      {...props}
      disabled={
        ballotCount > 0 && transaction?.status !== 'pending' && transaction?.status !== 'mined' ? false : true
      }
    >
      <Icon
        name="ballot"
        size={3}
        sx={{
          color:
            ballotCount > 0 && transaction?.status !== 'pending' && transaction?.status !== 'mined'
              ? 'onPrimary'
              : 'textSecondary',
          mr: 2
        }}
      />
      <StatusText {...{ transaction }} ballotCount={transaction?.status === 'pending' ? 0 : ballotCount} />
    </Button>
  );
};

const StatusText = ({
  transaction,
  ballotCount
}: {
  transaction?: Transaction;
  ballotCount: number;
}): JSX.Element => {
  const DEFAULT_TEXT = `Your Ballot: ${ballotCount} ${ballotCount === 1 ? 'vote' : 'votes'}`;
  const DEFAULT_COLOR = 'onPrimary';
  const color =
    ballotCount > 0 && transaction?.status !== 'pending' && transaction?.status !== 'mined'
      ? DEFAULT_COLOR
      : 'textSecondary';

  return (
    <Text
      sx={{
        color,
        fontWeight: ballotCount === 0 ? 'normal' : '600'
      }}
    >
      {DEFAULT_TEXT}
    </Text>
  );
};

export default BallotStatus;
