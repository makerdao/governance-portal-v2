import { useRouter } from 'next/router';
import { Text, Flex, Spinner } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import useBallotStore from '../stores/ballot';
import useAccountsStore from '../stores/accounts';

type Props = {
  network: string;
};

const BallotStatus = ({ network }: Props): JSX.Element => {
  const [ballot, txId] = useBallotStore(state => [state.ballot, state.txId]);
  const account = useAccountsStore(state => state.currentAccount);
  const ballotLength = Object.keys(ballot).length;
  const router = useRouter();
  return (
    <Flex
      sx={{
        width: '193px',
        height: '36px',
        mr: 3,
        borderRadius: 'round',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        border: txId ? '1px solid #F9A606' : ballotLength ? null : '1px solid #D4D9E1',
        backgroundColor: txId ? 'white' : ballotLength ? 'primary' : 'white',
        display: account ? ['none', 'none', 'flex', 'flex'] : 'none !important'
      }}
      onClick={() => router.push({ pathname: '/polling/review', query: network })}
      disabled={txId ? true : ballotLength ? false : true}
    >
      <Icon
        name={'ballot'}
        size={3}
        sx={{ color: ballotLength ? 'white' : 'textMuted', display: txId ? 'none' : null }}
      />
      <Spinner size={16} sx={{ color: 'mutedOrange', alignSelf: 'center', display: txId ? null : 'none' }} />
      <Text
        sx={{
          color: txId ? 'mutedOrange' : ballotLength ? 'white' : 'textMuted',
          fontWeight: ballotLength ? '600' : 'normal',
          fontSize: '13px',
          ml: 2
        }}
      >
        {txId ? 'Vote Pending' : `Your Ballot: ${ballotLength} ${ballotLength === 1 ? 'vote' : 'votes'}`}
      </Text>
    </Flex>
  );
};

export default BallotStatus;
