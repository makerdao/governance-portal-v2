import { Box, Button, Flex, Text } from 'theme-ui';
import TxIndicators from 'modules/app/components/TxIndicators';
import { Transaction, TXMined } from 'modules/web3/types/transaction';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import EtherscanLink from 'modules/web3/components/EtherscanLink';

export const TxFinal = ({
  title,
  description,
  buttonLabel,
  onClick,
  tx,
  success,
  children
}: {
  title: string;
  description: string | JSX.Element;
  buttonLabel: string;
  onClick: () => void;
  tx: Transaction;
  success: boolean;
  children?: React.ReactNode;
}): React.ReactElement => {
  const { network } = useWeb3();

  return (
    <Flex sx={{ flexDirection: 'column', textAlign: 'center' }}>
      <Text variant="microHeading">{title}</Text>
      {success ? (
        <Flex sx={{ alignItems: 'center', justifyContent: 'center', mt: 4 }}>
          <TxIndicators.Success sx={{ width: 6 }} />
        </Flex>
      ) : (
        <Flex sx={{ alignItems: 'center', justifyContent: 'center', mt: 4 }}>
          <TxIndicators.Failed sx={{ width: 6 }} />
        </Flex>
      )}
      <Flex sx={{ justifyContent: 'center' }}>
        <Text sx={{ color: 'secondaryEmphasis', mt: 3 }}>{description}</Text>
      </Flex>
      {children}

      <Box my={3}>
        <EtherscanLink
          hash={(tx as TXMined).hash}
          type="transaction"
          network={network}
          styles={{ justifyContent: 'center' }}
        />
      </Box>

      <Button data-testid="txfinal-btn" onClick={onClick} sx={{ width: '100%', mt: 3 }}>
        {buttonLabel}
      </Button>
    </Flex>
  );
};
