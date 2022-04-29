import { Box } from 'theme-ui';
import Davatar from 'lib/davatar';
import { useDelegateAddressMap } from 'modules/delegates/hooks/useDelegateAddressMap';
import { DelegatePicture } from 'modules/delegates/components';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';

export default function AddressIcon({
  address,
  width = 22
}: {
  address: string;
  width?: number;
}): React.ReactElement {
  const { data: delegateAddresses } = useDelegateAddressMap();
  const { library } = useActiveWeb3React();

  return (
    <Box sx={{ height: width, width: width }}>
      {delegateAddresses[address] ? (
        <DelegatePicture delegate={delegateAddresses[address]} width={width} />
      ) : (
        <Davatar size={width} address={address} provider={library} />
      )}
    </Box>
  );
}
