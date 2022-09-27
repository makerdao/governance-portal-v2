import { Flex, Button, Text, Close } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import { TXMined } from 'modules/web3/types/transaction';
import EtherScanLink from 'modules/web3/components/EtherScanLink';

const BurnTxSuccess = ({ tx, close }) => {
  const { network } = useWeb3();

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

        <EtherScanLink type="transaction" hash={(tx as TXMined).hash} network={network} />

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
