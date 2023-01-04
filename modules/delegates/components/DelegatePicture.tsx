/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Box, Flex, Image, Text } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { Delegate } from 'modules/delegates/types';
import { DelegateStatusEnum } from 'modules/delegates/delegates.constants';
import Tooltip from 'modules/app/components/Tooltip';
import { Address } from 'modules/address/components/Address';
import { Avatar } from 'modules/address/components/Avatar';

export function DelegatePicture({
  delegate,
  width = 41
}: {
  delegate: Delegate;
  width?: number;
}): React.ReactElement {
  const tooltipAvatarWidth = 68;
  const delegateMetrics = (
    <Box sx={{ maxWidth: ['auto', '530px'], width: ['auto', '530px'], display: 'block' }}>
      <Flex sx={{ p: 3 }}>
        <Box
          sx={{
            width: tooltipAvatarWidth,
            height: tooltipAvatarWidth,
            position: 'relative',
            minWidth: tooltipAvatarWidth
          }}
        >
          {delegate.picture ? (
            <Image
              src={delegate.picture}
              key={delegate.id}
              sx={{
                objectFit: 'cover',
                width: '100%',
                borderRadius: '100%',
                maxHeight: tooltipAvatarWidth
              }}
            />
          ) : (
            <Box>
              <Avatar size={tooltipAvatarWidth} address={delegate.address} />
            </Box>
          )}
          {delegate.status === DelegateStatusEnum.recognized && (
            <Icon
              name={'verified'}
              sx={{
                position: 'absolute',
                bottom: tooltipAvatarWidth / -12,
                right: tooltipAvatarWidth / -7,
                size: tooltipAvatarWidth / 2.5,
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
                bottom: tooltipAvatarWidth / -12,
                right: tooltipAvatarWidth / -7,
                size: tooltipAvatarWidth / 2.5
              }}
            />
          )}
        </Box>
        <Flex sx={{ ml: 3, flexDirection: 'column' }}>
          <Text as="p" variant="microHeading">
            {delegate.status === DelegateStatusEnum.recognized ? delegate.name : 'Shadow Delegate'}
          </Text>
          <Text as="p" sx={{ fontSize: 2, mt: 1 }}>
            <Address address={delegate.voteDelegateAddress} />
          </Text>
          <Text as="p" sx={{ fontSize: 2 }}>
            {delegate.status === DelegateStatusEnum.recognized ? 'Recognized Delegate' : 'Shadow Delegate'}
          </Text>
        </Flex>
      </Flex>
      <Flex sx={{ flexDirection: 'column', p: 3 }}>
        {delegate.cuMember && (
          <Flex sx={{ alignItems: 'center', mb: 3 }}>
            <Icon
              name={'info'}
              color="voterYellow"
              sx={{
                size: 13
              }}
            />
            <Text sx={{ ml: 1, fontSize: 2, fontWeight: 'semiBold' }}>
              This delegate is also a Core Unit member
            </Text>
          </Flex>
        )}
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

  return (
    <Box sx={{ width: width, height: width, position: 'relative', minWidth: width }}>
      <Box>
        <Tooltip label={delegateMetrics}>
          <Box>
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
                <Avatar size={width} address={delegate.address} />
              </Box>
            )}

            {delegate.status === DelegateStatusEnum.recognized && (
              <Icon
                name={'verified'}
                sx={{
                  position: 'absolute',
                  bottom: width / -12,
                  right: width / -7,
                  width: `${Math.round(width / 2.5)}px`,
                  color: 'primary'
                }}
              />
            )}
          </Box>
        </Tooltip>
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
    </Box>
  );
}
