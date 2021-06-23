import { Flex, Text, Box } from '@theme-ui/components';
import TxIndicators from 'components/TxIndicators';

type Props = {
  txPending: boolean;
  setTxId: any;
};

const TransactionContent = ({ txPending, setTxId }: Props): JSX.Element => (
  <Flex sx={{ flexDirection: 'column', textAlign: 'center' }}>
    <Text variant="microHeading" color="onBackgroundAlt">
      {txPending ? 'Transaction pending' : 'Confirm transaction'}
    </Text>

    <Flex sx={{ justifyContent: 'center', mt: 4 }}>
      <TxIndicators.Pending sx={{ width: 6 }} />
    </Flex>

    {!txPending && (
      <Box sx={{ mt: 4 }}>
        <Text sx={{ color: 'mutedAlt', fontSize: 3 }}>
          Please use your wallet to confirm this transaction.
        </Text>
        <Text sx={{ color: 'muted', cursor: 'pointer', fontSize: 2, mt: 2 }} onClick={() => setTxId(null)}>
          Cancel
        </Text>
      </Box>
    )}
  </Flex>
);

export default TransactionContent;
