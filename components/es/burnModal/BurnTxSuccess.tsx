/** @jsx jsx */
import { Flex, Button, Text, jsx, Close, Link } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';

import { getNetwork } from '../../../lib/maker';
import { getEtherscanLink } from '../../../lib/utils';
import { TXMined } from '@types/transaction';

const BurnTxSuccess = ({ tx, close }) => (
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
      <Text sx={{ color: 'onSecondary', fontWeight: 'medium', fontSize: '16px', textAlign: 'center' }}>
        You can safely close this modal
      </Text>
      <Icon name="burnSuccess" size={7} sx={{ my: 4 }} />

      <Link
        target="_blank"
        href={getEtherscanLink(getNetwork(), (tx as TXMined).hash, 'transaction')}
        sx={{ p: 0 }}
      >
        <Text mt={3} px={4} sx={{ textAlign: 'center', fontSize: 14, color: 'accentBlue' }}>
          View on Etherscan
          <Icon name="arrowTopRight" pt={2} color="accentBlue" />
        </Text>
      </Link>
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

export default BurnTxSuccess;
