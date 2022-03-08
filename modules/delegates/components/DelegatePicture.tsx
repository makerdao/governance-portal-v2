import { DelegateStatusEnum } from '../delegates.constants';
import { Box, Flex, Image, Text } from 'theme-ui';
import Davatar from '@davatar/react';
import { Icon } from '@makerdao/dai-ui-icons';
import { Delegate } from '../types';
import Tooltip from 'modules/app/components/Tooltip';
import { DelegateParticipationMetrics } from './DelegateParticipationMetrics';

export function DelegatePicture({
  delegate,
  width = 41
}: {
  delegate: Delegate;
  width?: number;
}): React.ReactElement {
  const delegateMetrics = (
    <Box sx={{ maxWidth: ['auto', '530px'], width: ['auto', '530px'], display: 'block' }}>
      <Flex sx={{ p: 3 }}>
        <DelegatePicture delegate={delegate} key={delegate.id} width={68} />
        <Flex sx={{ ml: 3, flexDirection: 'column' }}>
          <Text as="p" variant="microHeading">
            {delegate.status === DelegateStatusEnum.recognized ? delegate.name : 'Shadow Delegate'}
          </Text>
          <Text as="p" sx={{ fontSize: 2, mt: 1 }}>
            {delegate.voteDelegateAddress}
          </Text>
          <Text as="p" sx={{ fontSize: 2 }}>
            {delegate.status === DelegateStatusEnum.recognized ? 'Recognized Delegate' : 'Shadow Delegate'}
          </Text>
          <Box sx={{ marginLeft: 1, flex: 1 }}>
            <DelegateParticipationMetrics delegate={delegate} />
          </Box>
        </Flex>
      </Flex>
    </Box>
  );

  return (
    <Box sx={{ width: width, height: width, position: 'relative', minWidth: width }}>
      <Tooltip label={delegateMetrics}>
        {delegate.picture ? (
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
        ) : (
          <Box>
            <Davatar size={width} address={delegate.address} generatedAvatarType="jazzicon" />
          </Box>
        )}
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
      {delegate.status === DelegateStatusEnum.shadow && (
        <Icon
          name={'shadowQuestion'}
          color="voterYellow"
          sx={{
            position: 'absolute',
            bottom: '-2px',
            right: '-5px',
            width: '12px'
          }}
        />
      )}
    </Box>
  );
}
