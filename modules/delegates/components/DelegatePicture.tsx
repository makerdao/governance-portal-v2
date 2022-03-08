import { DelegateStatusEnum } from '../delegates.constants';
import { Box, Flex, Image, Text } from 'theme-ui';
import Davatar from '@davatar/react';
import { Icon } from '@makerdao/dai-ui-icons';
import { Delegate } from '../types';
import Tooltip from 'modules/app/components/Tooltip';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';

export function DelegatePicture({
  delegate,
  width = 41
}: {
  delegate: Delegate;
  width?: number;
}): React.ReactElement {
  const { library } = useActiveWeb3React();

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
        </Flex>
      </Flex>
      <Flex sx={{ flexDirection: 'column', p: 3 }}>
        <Text as="p" variant="secondary">
          Participation Breakdown
        </Text>
        <Flex sx={{ justifyContent: 'space-between', mt: 2 }}>
          <Flex sx={{ flexDirection: 'column' }}>
            <Text as="p" sx={{ fontWeight: 'semiBold' }}>
              {delegate.pollParticipation || 'Untracked'}
            </Text>
            <Text as="p" sx={{ fontSize: 2 }}>
              Poll Participation
            </Text>
          </Flex>
          <Flex sx={{ flexDirection: 'column' }}>
            <Text as="p" sx={{ fontWeight: 'semiBold' }}>
              {delegate.executiveParticipation || 'Untracked'}
            </Text>
            <Text as="p" sx={{ fontSize: 2 }}>
              Executive Participation
            </Text>
          </Flex>
          <Flex sx={{ flexDirection: 'column' }}>
            <Text as="p" sx={{ fontWeight: 'semiBold' }}>
              {delegate.communication || 'Untracked'}
            </Text>
            <Text as="p" sx={{ fontSize: 2 }}>
              Communication
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );

  console.log(width / 8.3);
  console.log(width / 9);
  console.log(width / 10);

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
            <Davatar
              size={width}
              address={delegate.address}
              generatedAvatarType="jazzicon"
              provider={library}
            />
          </Box>
        )}
      </Tooltip>
      {delegate.status === DelegateStatusEnum.recognized && (
        <Icon
          name={'verified'}
          sx={{
            position: 'absolute',
            bottom: width / -12,
            right: width / -7,
            size: width / 2.5,
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
            bottom: width / -12,
            right: width / -7,
            size: width / 2.5
          }}
        />
      )}
    </Box>
  );
}
