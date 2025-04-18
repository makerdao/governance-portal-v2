/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Flex, Text, Spinner } from 'theme-ui';
import Icon from '../../Icon';

import { Transaction } from 'modules/web3/types/transaction';
import EtherscanLink from 'modules/web3/components/EtherscanLink';
import { useNetwork } from 'modules/app/hooks/useNetwork';

type Props = {
  tx: Transaction;
  index: number;
};

type MainProps = {
  txs: Transaction[];
};
const TransactionRow = ({ tx, index }: Props): JSX.Element => {
  const network = useNetwork();

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
            size={16}
            sx={{
              color: 'orangeAttention',
              alignSelf: 'center'
            }}
          />
        )}
        {tx.status === 'mined' && <Icon name="checkmark" color="primary" />}
        <Text sx={{ ml: 3 }}>{tx.message}</Text>
      </Flex>
      <EtherscanLink
        hash={tx.hash as string}
        type="transaction"
        network={tx.gaslessNetwork ? tx.gaslessNetwork : network}
      />
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
