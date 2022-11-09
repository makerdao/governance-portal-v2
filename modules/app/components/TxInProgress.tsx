import { Flex, Text, Box } from '@theme-ui/components';
import TxIndicators from 'modules/app/components/TxIndicators';
import { TXMined } from 'modules/web3/types/transaction';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import EtherscanLink from 'modules/web3/components/EtherscanLink';

type Props = {
  tx: any;
  txPending: boolean;
  setTxId: any;
};

export const TxInProgress = ({ tx, txPending, setTxId }: Props): JSX.Element => {
  const { network } = useWeb3();

  return (
    <Flex sx={{ flexDirection: 'column', textAlign: 'center' }}>
      <Text variant="microHeading">{txPending ? 'Transaction Pending' : 'Confirm Transaction'}</Text>

      <Flex sx={{ justifyContent: 'center', mt: 4 }}>
        <TxIndicators.Pending sx={{ width: 6 }} />
      </Flex>

      {txPending && (
        <EtherscanLink
          hash={(tx as TXMined).hash}
          type="transaction"
          network={network}
          styles={{ justifyContent: 'center' }}
        />
      )}

      {!txPending && (
        <Box sx={{ mt: 4 }}>
          <Text as="p" sx={{ color: 'secondaryEmphasis', fontSize: 3 }}>
            Please use your wallet to confirm this transaction.
          </Text>
          <Text
            as="p"
            sx={{ color: 'secondary', cursor: 'pointer', fontSize: 2, mt: 2 }}
            onClick={() => setTxId(null)}
          >
            Cancel
          </Text>
        </Box>
      )}
    </Flex>
  );
};
