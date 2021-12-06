import { DelegateStatusEnum } from '../delegates.constants';
import { Box, Flex, Image } from 'theme-ui';
import { Jazzicon } from '@ukstv/jazzicon-react';
import { Icon } from '@makerdao/dai-ui-icons';
import { Delegate } from '../types';
import Tooltip from 'modules/app/components/Tooltip';
import { DelegateParticipationMetrics } from './DelegateParticipationMetrics';

export function DelegatePicture({
  delegate,
  width = '41px'
}: {
  delegate: Delegate;
  width?: string;
}): React.ReactElement {
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
    <Box sx={{ width: width, height: width, position: 'relative', minWidth: width }}>
      {delegate.picture ? (
        <Tooltip label={delegateMetrics}>
          <Image
            src={delegate.picture}
            key={delegate.id}
            sx={{
              objectFit: 'cover',
              width: '100%',
              borderRadius: '100%',
              maxHeight: width
            }}
          />
        </Tooltip>
      ) : (
        <Jazzicon address={delegate.address} sx={{ height: width, width: width }} />
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
