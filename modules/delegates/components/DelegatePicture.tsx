/** @jsx jsx */
import { DelegateStatusEnum } from '../delegates.constants';
import { Box, Image, jsx } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { Delegate } from '../types';
import Tooltip from 'components/Tooltip';
import { DelegateParticipationMetrics } from './DelegateParticipationMetrics';

export function DelegatePicture({ delegate }: { delegate: Delegate }): React.ReactElement {

  const delegatePicture  = delegate.picture || '/assets/empty-profile-picture.svg';


  const delegateMetrics = (
    <Box sx={{ maxWidth: ['auto', '530px'], width: ['auto', '530px'], display: 'block'}}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: ['column', 'row'] }}>
        <img  sx={{ borderRadius: '100%', width: ['150px', '200px'], height: ['150px', '200px'] }} src={delegatePicture} />
        <Box sx={{ marginLeft: 1, flex: 1 }}>
          <DelegateParticipationMetrics delegate={delegate} />
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ width: '41px', height: '41px', position: 'relative', minWidth: '41px' }}>
      <Tooltip label={delegateMetrics}>
        <Image
          src={delegatePicture}
          key={delegate.id}
          sx={{
            objectFit: 'cover',
            width: '100%',
            borderRadius: '100%',
            maxHeight: '41px'
          }}
        /> 

      </Tooltip>
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
