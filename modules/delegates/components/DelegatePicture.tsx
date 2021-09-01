/** @jsx jsx */
import { DelegateStatusEnum } from '../delegates.constants';
import { Box, Image, jsx } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { Delegate } from '../types';
import Tooltip from 'components/Tooltip';
import { DelegateParticipationMetrics } from './DelegateParticipationMetrics';
import { CurrentlySupportingExecutive } from 'modules/executives/components/CurrentlySupportingExecutive';

export function DelegatePicture({ delegate }: { delegate: Delegate }): React.ReactElement {

  const delegatePicture  = delegate.picture || '/assets/empty-profile-picture.svg';


  const delegateMetrics = (
    <Box sx={{ display: 'flex'}}>
      
      <img width='200px' height='200px' src={delegatePicture} />
      <Box sx={{ marginLeft: 1 }}>
        <DelegateParticipationMetrics delegate={delegate} />
        <CurrentlySupportingExecutive address={delegate.voteDelegateAddress} />

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
