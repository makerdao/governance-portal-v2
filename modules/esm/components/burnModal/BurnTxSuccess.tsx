/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Flex, Button, Text, Close } from 'theme-ui';
import Icon from 'modules/app/components/Icon';
import EtherscanLink from 'modules/web3/components/EtherscanLink';
import { useNetwork } from 'modules/app/hooks/useNetwork';

const BurnTxSuccess = ({ txHash, close }: { txHash: `0x${string}` | undefined; close: () => void }) => {
  const network = useNetwork();

  return (
    <Flex sx={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Close
        aria-label="close"
        sx={{ height: '20px', width: '20px', p: 0, alignSelf: 'flex-end' }}
        onClick={close}
      />

      <Text variant="heading" sx={{ fontSize: 6 }}>
        MKR successfully burned in ESM
      </Text>
      <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
        <Text as="p" sx={{ color: 'onSecondary', fontWeight: 'medium', textAlign: 'center', mt: 2 }}>
          You can safely close this modal
        </Text>
        <Icon name="burnSuccess" size={7} sx={{ my: 4 }} />

        {txHash && <EtherscanLink type="transaction" hash={txHash} network={network} />}

        <Button
          onClick={close}
          sx={{ mt: 4, borderColor: 'primary', width: '100%', color: 'primary' }}
          variant="outline"
        >
          Close
        </Button>
      </Flex>
    </Flex>
  );
};

export default BurnTxSuccess;
