import { Flex, Text, Label } from 'theme-ui';
import { useDelegationMigrationStatus } from '../hooks/useDelegationMigrationStatus';

export function ConnectWallet(): JSX.Element {
  const { newOwnerAddress } = useDelegationMigrationStatus();
  return (
    <Flex>
      <Flex sx={{ flexDirection: 'column', width: '50%' }}>
        <Text as="h3" sx={{ fontWeight: 'semiBold' }}>
          Connect to your new address to continue
        </Text>
        <Label sx={{ mt: 4 }}>Enter new address</Label>
        <Text variant="secondary">{newOwnerAddress}</Text>
      </Flex>
      <Flex sx={{ width: '50%', flexDirection: 'column' }}>
        {/* <Text as="h3" sx={{ fontWeight: 'semiBold' }}>
          But first, remember to disconnect your current wallet address
        </Text> */}
      </Flex>
    </Flex>
  );
}
