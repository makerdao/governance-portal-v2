import { Box } from 'theme-ui';
import Davatar from '@davatar/react';

export default function AddressIcon({
  address,
  width = 22
}: {
  address: string;
  width?: number;
}): React.ReactElement {
  return (
    <Box sx={{ height: width, width: width }}>
      <Davatar size={width} address={address} generatedAvatarType="jazzicon" />
    </Box>
  );
}
