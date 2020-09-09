import { jsx, Flex, Text, Spinner, Button, Link as ExternalLink } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';

const TransactionRow = ({ tx, index }) => {
  return (
    <Flex
      sx={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: index ? '1px solid #D4D9E1' : null,
        py: 2
      }}
    >
      <Flex>
        {tx.status === 'pending' && (
          <Spinner
            size={'16px'}
            sx={{
              color: 'mutedOrange',
              alignSelf: 'center'
            }}
          />
        )}
        {tx.status === 'mined' && <Icon name="checkmark" color="primary" />}
        <Text sx={{ ml: 3 }}>{`${tx.message}`}</Text>
      </Flex>
      <ExternalLink href={`https://etherscan.io/tx/${tx.hash}`} target="_blank">
        <Button
          variant="smallOutline"
          sx={{ color: 'accentBlue', borderColor: 'accentBlue', borderRadius: 'small' }}
        >
          View
          <Icon name="arrowTopRight" color="accentBlue" sx={{ ml: 1, width: 2, height: 2 }} />
        </Button>
      </ExternalLink>
    </Flex>
  );
};

export default ({ txs }) => {
  return (
    <>
      <Text sx={{ mt: 4, mb: 3 }}>Transactions</Text>
      {txs.map((tx, index) => {
        return <TransactionRow tx={tx} index={index} key={index} />;
      })}
    </>
  );
};
