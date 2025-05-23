/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Button, Flex, Text } from 'theme-ui';

export const ApprovalContent = ({ title, description, buttonLabel, onClick, disabled }) => (
  <Flex sx={{ flexDirection: 'column', textAlign: 'center' }}>
    <Text variant="microHeading">{title}</Text>
    <Text sx={{ color: 'secondaryEmphasis', mt: 3 }}>{description}</Text>
    <Button onClick={onClick} disabled={disabled} sx={{ width: '100%', mt: 3 }}>
      {buttonLabel}
    </Button>
  </Flex>
);
