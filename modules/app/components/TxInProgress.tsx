import { Flex, Text, Box, Link } from '@theme-ui/components';
import { Icon } from '@makerdao/dai-ui-icons';
import TxIndicators from 'modules/app/components/TxIndicators';
import { TXMined } from 'modules/app/types/transaction';
import { getNetwork } from 'lib/maker';
import { getEtherscanLink } from 'lib/utils';

type Props = {
  tx: any;
  txPending: boolean;
  setTxId: any;
};

export const TxInProgress = ({ tx, txPending, setTxId }: Props): JSX.Element => (
  <Flex sx={{ flexDirection: 'column', textAlign: 'center' }}>
    <Text variant="microHeading" color="onBackgroundAlt">
      {txPending ? 'Transaction Pending' : 'Confirm Transaction'}
    </Text>

    <Flex sx={{ justifyContent: 'center', mt: 4 }}>
      <TxIndicators.Pending sx={{ width: 6 }} />
    </Flex>

    {txPending && (
      <Link
        target="_blank"
        href={getEtherscanLink(getNetwork(), (tx as TXMined).hash, 'transaction')}
        sx={{ my: 3 }}
      >
        <Text mt={3} px={4} sx={{ textAlign: 'center', fontSize: 14, color: 'accentBlue' }}>
          View on Etherscan
          <Icon name="arrowTopRight" pt={2} color="accentBlue" />
        </Text>
      </Link>
    )}

    {!txPending && (
      <Box sx={{ mt: 4 }}>
        <Text as="p" sx={{ color: 'mutedAlt', fontSize: 3 }}>
          Please use your wallet to confirm this transaction.
        </Text>
        <Text
          as="p"
          sx={{ color: 'muted', cursor: 'pointer', fontSize: 2, mt: 2 }}
          onClick={() => setTxId(null)}
        >
          Cancel
        </Text>
      </Box>
    )}
  </Flex>
);
