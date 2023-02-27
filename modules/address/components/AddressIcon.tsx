/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Box } from 'theme-ui';
import { Avatar } from 'modules/address/components/Avatar';
import { useDelegateNameAndMetricsByAddress } from 'modules/delegates/hooks/useDelegateNameAndMetricsByAddress';
import { DelegatePicture } from 'modules/delegates/components';

export default function AddressIcon({
  address,
  width = 22
}: {
  address: string;
  width?: number;
}): React.ReactElement {
  const { data: delegate } = useDelegateNameAndMetricsByAddress(address);

  return (
    <Box sx={{ height: width, width: width }}>
      {delegate ? (
        <DelegatePicture delegate={delegate} width={width} />
      ) : (
        <Avatar size={width} address={address} />
      )}
    </Box>
  );
}
