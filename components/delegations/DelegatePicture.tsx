import { DelegateStatusEnum } from 'lib/delegates/constants';
import { Box, Image } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { Delegate } from 'types/delegate';

export function DelegatePicture({ delegate }: { delegate: Delegate }): React.ReactElement {
  return (
    <Box sx={{ width: '41px', height: '41px', position: 'relative' }}>
      <Image
        src={delegate.picture || '/assets/empty-profile-picture.svg'}
        key={delegate.id}
        sx={{
          objectFit: 'cover',
          width: '100%',
          borderRadius: '100%',
          maxHeight: '41px'
        }}
      />
      {delegate.status === DelegateStatusEnum.recognized && (
        <Icon
          name={'verified'}
          sx={{
            position: 'absolute',
            bottom: '-2px',
            right: '-5px',
            width: '12px',
            color: 'primary'
          }}
        />
      )}
    </Box>
  );
}
