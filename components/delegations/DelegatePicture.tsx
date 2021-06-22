import { Box, Image } from 'theme-ui';
import { Delegate } from '../../types/delegate';

export default function DelegatePicture({ delegate }: { delegate: Delegate }): React.ReactElement {
  return (
    <Box sx={{ width: '41px', height: '41px', position: 'relative' }}>
      <Image
        src={delegate.picture || '/assets/empty-profile-picture.svg'}
        sx={{
          objectFit: 'cover',
          width: '100%',
          borderRadius: '100%'
        }}
      />
      <Image
        src="/assets/verified-check.svg"
        sx={{
          position: 'absolute',
          bottom: '5px',
          right: '0',
          width: '12px'
        }}
      />
    </Box>
  );
}
