/** @jsx jsx */

import { Flex, Text, Spinner, Button, Link as ExternalLink, jsx } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';

import { getEtherscanLink } from '../../lib/utils';
import { getNetwork } from '../../lib/maker';
import Transaction, { TXPending } from '../../types/transaction';

type Props = {
  tx: Transaction;
  index: number;
};

type MainProps = {
  txs: Transaction[];
};
const TransactionRow = ({ tx, index }: Props): JSX.Element => {
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
              color: 'mutedOrange',
              alignSelf: 'center'
            }}
          />
        )}
        {tx.status === 'mined' && <Icon name="checkmark" color="primary" />}
        <Text sx={{ ml: 3 }}>{tx.message}</Text>
      </Flex>
      <ExternalLink
        href={getEtherscanLink(getNetwork(), (tx as TXPending).hash, 'transaction')}
        target="_blank"
      >
        <Button
          variant="smallOutline"
          sx={{ color: 'accentBlue', borderColor: 'accentBlue', borderRadius: 'small' }}
        >
          View
          <Icon
            name="arrowTopRight"
            color="accentBlue"
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
