/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Delegate } from '../types';
import { Flex, Text } from 'theme-ui';
import { InternalLink } from 'modules/app/components/InternalLink';
import { DelegatePicture } from 'modules/delegates/components';

export default function DelegateAvatarNameLight({ delegate }: { delegate: Delegate }): React.ReactElement {
  return (
    <InternalLink href={`/address/${delegate.voteDelegateAddress}`} title="View profile details">
      <Flex sx={{ alignItems: 'center', gap: 2 }}>
        <DelegatePicture delegate={delegate} />
        <Text sx={{ color: 'primary', fontWeight: 'semiBold' }}>{delegate.name}</Text>
      </Flex>
    </InternalLink>
  );
}
