import { Box } from 'theme-ui';
import { Avatar } from 'modules/address/components/Avatar';
import { useDelegateAddressMap } from 'modules/delegates/hooks/useDelegateAddressMap';
import { DelegatePicture } from 'modules/delegates/components';

export default function AddressIcon({
  address,
  width = 22
}: {
  address: string;
  width?: number;
}): React.ReactElement {
  const { data: delegateAddresses } = useDelegateAddressMap();

  return (
    <Box sx={{ height: width, width: width }}>
      {delegateAddresses[address] ? (
        <DelegatePicture delegate={delegateAddresses[address]} width={width} />
      ) : (
        <Avatar size={width} address={address} />
      )}
    </Box>
  );
}
