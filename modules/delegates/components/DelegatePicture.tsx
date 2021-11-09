import { DelegateStatusEnum } from '../delegates.constants';
import { Box, Flex, Image, jsx } from 'theme-ui';
import { Jazzicon } from '@ukstv/jazzicon-react';
import { Icon } from '@makerdao/dai-ui-icons';
import { Delegate } from '../types';
import Tooltip from 'modules/app/components/Tooltip';
import { DelegateParticipationMetrics } from './DelegateParticipationMetrics';

export function DelegatePicture({ delegate }: { delegate: Delegate }): React.ReactElement {
  const delegateMetrics = (
    <Box sx={{ maxWidth: ['auto', '530px'], width: ['auto', '530px'], display: 'block' }}>
      <Flex
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: ['column', 'row']
        }}
      >
        {delegate.picture ? (
          <img
            sx={{ borderRadius: '100%', width: ['150px', '200px'], height: ['150px', '200px'] }}
            src={delegate.picture}
          />
        ) : (
          <Jazzicon
            address={delegate.address}
            sx={{ height: ['150px', '200px'], width: ['150px', '200px'] }}
          />
        )}
        <Box sx={{ marginLeft: 1, flex: 1 }}>
          <DelegateParticipationMetrics delegate={delegate} />
        </Box>
      </Flex>
    </Box>
  );

  return (
    <Box sx={{ width: '41px', height: '41px', position: 'relative', minWidth: '41px' }}>
      {delegate.picture ? (
        <Tooltip label={delegateMetrics}>
          <Image
            src={delegate.picture}
            key={delegate.id}
            sx={{
              objectFit: 'cover',
              width: '100%',
              borderRadius: '100%',
              maxHeight: '41px'
            }}
          />
        </Tooltip>
      ) : (
        <Jazzicon address={delegate.address} sx={{ height: '41px', width: '41px' }} />
      )}
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
