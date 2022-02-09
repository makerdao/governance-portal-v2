import { DelegatePicture } from 'modules/delegates/components';
import { useDelegateAddressMap } from 'modules/delegates/hooks/useDelegateAddressMap';
import { Box, Text, Flex } from 'theme-ui';
import { Address } from './Address';
import AddressIcon from './AddressIcon';

export default function AddressIconAndName({
  address,
  width
}: {
  address: string;
  width: number;
}): React.ReactElement {
  const { data: delegateAddresses } = useDelegateAddressMap();

  return (
    <Flex sx={{ alignItems: 'center', justifyContent: 'flex-start' }}>
      <Box sx={{ mr: 2 }}>
        {delegateAddresses[address] ? (
          <DelegatePicture delegate={delegateAddresses[address]} width={width} />
        ) : (
          <AddressIcon address={address} width={width} />
        )}
      </Box>
      <Box>
        {delegateAddresses[address] ? (
          <Text>{delegateAddresses[address].name}</Text>
        ) : (
          <Address address={address} />
        )}
      </Box>
    </Flex>
  );
}
