import { Flex, Button, Text, Close, Spinner } from 'theme-ui';

const BurnSigning = ({ close }) => (
  <Flex sx={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
    <Close
      aria-label="close"
      sx={{ height: '20px', width: '20px', p: 0, alignSelf: 'flex-end' }}
      onClick={close}
    />

    <Text variant="heading" sx={{ fontSize: 6 }}>
      Sign Transaction
    </Text>
    <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
      <Spinner size="60px" sx={{ color: 'primary', alignSelf: 'center', my: 4 }} />
      <Text sx={{ color: 'onSecondary', fontWeight: 'medium', fontSize: 3 }}>
        Please use your wallet to sign this transaction.
      </Text>
      <Button onClick={close} variant="textual" sx={{ mt: 3, color: 'muted', fontSize: 2 }}>
        Cancel burn submission
      </Button>
    </Flex>
  </Flex>
);

export default BurnSigning;
