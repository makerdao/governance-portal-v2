/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Box, Flex, Image, Text } from 'theme-ui';
import { InternalLink } from 'modules/app/components/InternalLink';
import { Avc } from '../types/avc';
import Jazzicon from 'modules/address/components/Jazzicon';

export default function AvcAvatarName({ avc }: { avc: Avc }): React.ReactElement {
  return (
    <InternalLink href={`/avc/${avc.id}`} title="View AVC details">
      <Flex sx={{ alignItems: 'center' }}>
        <Box sx={{ width: 41, height: 41, position: 'relative', minWidth: 41 }}>
          {avc.picture ? (
            <Image
              src={avc.picture}
              key={avc.picture}
              sx={{
                objectFit: 'cover',
                width: '100%',
                borderRadius: '100%',
                maxHeight: 41
              }}
            />
          ) : (
            // Turn AVC name into a number to feed into the Jazzicon generator
            <Jazzicon
              address={avc.name
                .split('')
                .map(c => c.charCodeAt(0))
                .join('')}
              size={41}
            />
          )}
        </Box>
        <Text as="p" variant="microHeading" sx={{ fontSize: [3, 4], overflowWrap: 'break-word', pl: 2 }}>
          {avc.name}
        </Text>
      </Flex>
    </InternalLink>
  );
}
