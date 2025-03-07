/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Flex, Text, Box } from '@theme-ui/components';
import TxIndicators from 'modules/app/components/TxIndicators';
import EtherscanLink from 'modules/web3/components/EtherscanLink';
import { useNetwork } from '../hooks/useNetwork';
import { TxStatus } from 'modules/web3/constants/transaction';
import { Dispatch, SetStateAction } from 'react';

type Props = {
  txStatus: TxStatus;
  setTxStatus: Dispatch<SetStateAction<TxStatus>>;
  txHash: `0x${string}` | undefined;
  setTxHash: Dispatch<SetStateAction<`0x${string}` | undefined>>;
};

export const TxInProgress = ({ txStatus, setTxStatus, txHash, setTxHash }: Props): JSX.Element => {
  const network = useNetwork();

  return (
    <Flex sx={{ flexDirection: 'column', textAlign: 'center' }}>
      <Text variant="microHeading">
        {txStatus === TxStatus.LOADING ? 'Transaction Pending' : 'Confirm Transaction'}
      </Text>

      <Flex sx={{ justifyContent: 'center', mt: 4 }}>
        <TxIndicators.Pending sx={{ width: 6 }} />
      </Flex>

      {txHash && (
        <EtherscanLink
          hash={txHash}
          type="transaction"
          network={network}
          styles={{ justifyContent: 'center' }}
        />
      )}

      {txStatus !== TxStatus.LOADING && (
        <Box sx={{ mt: 4 }}>
          <Text as="p" sx={{ color: 'secondaryEmphasis', fontSize: 3 }}>
            Please use your wallet to confirm this transaction.
          </Text>
          <Text
            as="p"
            sx={{ color: 'secondary', cursor: 'pointer', fontSize: 2, mt: 2 }}
            onClick={() => {
              setTxStatus(TxStatus.IDLE);
              setTxHash(undefined);
            }}
          >
            Cancel
          </Text>
        </Box>
      )}
    </Flex>
  );
};
