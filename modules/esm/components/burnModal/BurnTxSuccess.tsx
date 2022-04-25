import { Flex, Button, Text, Close } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { getEtherscanLink } from 'modules/web3/helpers/getEtherscanLink';
import { TXMined } from 'modules/web3/types/transaction';
import { ExternalLink } from 'modules/app/components/ExternalLink';

const BurnTxSuccess = ({ tx, close }) => {
  const { network } = useActiveWeb3React();

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

        <ExternalLink
          href={getEtherscanLink(network, (tx as TXMined).hash, 'transaction')}
          styles={{ p: 0 }}
          title="View on etherscan"
        >
          <Text mt={3} px={4} sx={{ textAlign: 'center', fontSize: 14, color: 'accentBlue' }}>
            View on Etherscan
            <Icon name="arrowTopRight" pt={2} color="accentBlue" />
          </Text>
        </ExternalLink>
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
