import { Flex, Text, Spinner, Button, Link as ExternalLink } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';

import { getEtherscanLink } from 'modules/web3/helpers/getEtherscanLink';
import { Transaction, TXPending } from 'modules/web3/types/transaction';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';

type Props = {
  tx: Transaction;
  index: number;
};

type MainProps = {
  txs: Transaction[];
};
const TransactionRow = ({ tx, index }: Props): JSX.Element => {
  const { network } = useWeb3();

  return (
    <Flex
      sx={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: index ? '1px solid #D4D9E1' : undefined,
        py: 2
      }}
    >
      <Flex sx={{ alignItems: 'center' }}>
        {tx.status === 'pending' && (
          <Spinner
            size={'16px'}
            sx={{
              color: 'orangeAttention',
              alignSelf: 'center'
            }}
          />
        )}
        {tx.status === 'mined' && <Icon name="checkmark" color="primary" />}
        <Text sx={{ ml: 3 }}>{tx.message}</Text>
      </Flex>
      <ExternalLink href={getEtherscanLink(network, (tx as TXPending).hash, 'transaction')} target="_blank">
        <Button
          variant="smallOutline"
          sx={{
            color: 'accentBlue',
            borderColor: 'accentBlue',
            borderRadius: 'small',
            '&:hover': {
              color: 'accentBlueEmphasis',
              borderColor: 'accentBlueEmphasis'
            }
          }}
        >
          View
          <Icon
            name="arrowTopRight"
            color="inherit"
            sx={{ ml: 1, width: 2, height: 2, alignSelf: 'center', justifyContent: 'center' }}
          />
        </Button>
      </ExternalLink>
    </Flex>
  );
};

export default function TransactionBox({ txs }: MainProps): JSX.Element {
  return (
    <>
      <Text sx={{ mt: 4, mb: 3 }}>Transactions</Text>
      {txs.map((tx, index) => {
        return <TransactionRow tx={tx} index={index} key={index} />;
      })}
    </>
  );
}
