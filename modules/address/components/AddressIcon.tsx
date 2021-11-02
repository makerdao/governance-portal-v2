 
import { jsx, Box } from 'theme-ui';
import { Jazzicon } from '@ukstv/jazzicon-react';

export default function AddressIcon({
  address,
  width = '22px'
}: {
  address: string;
  width?: string;
}): React.ReactElement {
  return (
    <Box sx={{ height: width, width: width }}>
      <Jazzicon address={address} sx={{ height: width, width: width }} />
    </Box>
  );
}
