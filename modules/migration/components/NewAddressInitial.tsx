import { useState } from 'react';
import { Alert, Button, Flex, Text, Input, Label } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';

export function NewAddressInitial({
  handleSubmitNewAddress
}: {
  handleSubmitNewAddress: () => void;
}): JSX.Element {
  const [newAddress, setNewAddress] = useState('');

  const handleInput = e => {
    setNewAddress(e.target.value);
  };

  return (
    <Flex sx={{ flexDirection: 'column' }}>
      <Flex>
        <Flex sx={{ width: '60%', flexDirection: 'column', pr: 5 }}>
          <Text as="h3" sx={{ fontWeight: 'semiBold' }}>
            Please enter a different wallet address that will be used to generate your new delegate contract
          </Text>
          <Text as="p" variant="secondary" sx={{ mt: 2 }}>
            Clicking ’submit address’ spawns a message you are required to sign using your current connected
            wallet. DUX team will verify the message and establish a link between your old and renewed
            delegate contracts.
          </Text>
        </Flex>
        <Flex sx={{ width: '40%' }}>
          <Flex sx={{ bg: 'onSurfaceAlt', p: 3 }}>
            <Flex sx={{ mt: '5px', mr: 3, m1: 1, alignContent: 'flex-start', width: '100px' }}>
              <Icon name="gnosis" />
            </Flex>
            <Flex sx={{ flexDirection: 'column' }}>
              <Text>Are you a Gnosis Safe user?</Text>
              <Text variant="secondary">
                Gnosis Safe does not yet support off-chain message signing. Please sign the message through
                posting the transaction to Ethereum mainnet and contact DUX Core Unit once successful.
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      <Alert variant="notice" sx={{ my: 4 }}>
        You need to use a different wallet for generating your new delegate contract address. Make sure the
        address is different from the currently connected address, and make sure you are the sole operator of
        the address.{' '}
      </Alert>
      <Label variant="microHeading" sx={{ fontSize: 2, mb: 1, fontWeight: 'bold' }}>
        Enter new address
      </Label>
      <Flex>
        <Input
          name="search"
          onChange={handleInput}
          type="search"
          value={newAddress}
          sx={{
            px: 3,
            mr: 3,
            maxWidth: 460
          }}
        />
        <Button onClick={handleSubmitNewAddress} sx={{ minWidth: 300 }}>
          Submit address
        </Button>
      </Flex>
    </Flex>
  );
}
