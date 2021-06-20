import { Box, Image } from 'theme-ui';
import { Delegate } from '../../types/delegate';

export default function DelegatePicture({ delegate }: { delegate: Delegate }): React.ReactElement {
  return (
    <Box>
      <Image
        src={delegate.picture || '/assets/empty-profile-picture.svg'}
        sx={{
          objectFit: 'cover',
          width: '100%',
          borderRadius: '100%'
        }}
      />
    </Box>
  );
}
