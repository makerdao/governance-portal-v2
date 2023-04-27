/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Box, Image } from 'theme-ui';
import Icon from 'modules/app/components/Icon';
import { Delegate, DelegateInfo, DelegatePaginated } from 'modules/delegates/types';
import { DelegateStatusEnum } from 'modules/delegates/delegates.constants';
import Tooltip from 'modules/app/components/Tooltip';
import { Avatar } from 'modules/address/components/Avatar';
import { DelegateAvatarTooltip } from 'modules/delegates/components/DelegateAvatarTooltip';

export function DelegatePicture({
  delegate,
  cvcPicture,
  width = 41,
  showTooltip = true
}: {
  cvcPicture?: string;
  delegate?: Delegate | DelegatePaginated | DelegateInfo;
  width?: number;
  showTooltip?: boolean;
}): React.ReactElement {
  // if cvc is passed in, return cvc picture
  if (cvcPicture) {
    return (
      <Box sx={{ width: width, height: width, position: 'relative', minWidth: width }}>
        <Image
          src={cvcPicture}
          key={cvcPicture}
          sx={{
            objectFit: 'cover',
            width: '100%',
            borderRadius: '100%',
            maxHeight: width
          }}
        />
      </Box>
    );
  }

  // if delegate is passed in, return delegate picture
  if (delegate) {
    return (
      <Box sx={{ width: width, height: width, position: 'relative', minWidth: width }}>
        <Box>
          <Tooltip
            label={<DelegateAvatarTooltip tooltipAvatarWidth={68} delegate={delegate} />}
            disable={!showTooltip}
          >
            <Box>
              {delegate.picture ? (
                <Image
                  src={delegate.picture}
                  key={delegate.voteDelegateAddress}
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

              {delegate.status === DelegateStatusEnum.constitutional && (
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

  // no cvc or delegate passed in, return empty image
  return (
    <Box sx={{ width: width, height: width, position: 'relative', minWidth: width }}>
      <Image
        src={cvcPicture}
        key={cvcPicture}
        sx={{
          objectFit: 'cover',
          width: '100%',
          borderRadius: '100%',
          maxHeight: width
        }}
      />
    </Box>
  );
}
