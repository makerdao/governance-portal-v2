/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import InternalIcon from 'modules/app/components/Icon';
import { Text, Flex } from 'theme-ui';

export default function CommentCount({ count }: { count: number }): React.ReactElement {
  return (
    <Flex sx={{ alignItems: 'center' }}>
      <InternalIcon name="comment" />
      <Text as="p" variant="caps" sx={{ ml: 2 }}>
        {count} Comment{count > 1 ? 's' : ''}
      </Text>
    </Flex>
  );
}
