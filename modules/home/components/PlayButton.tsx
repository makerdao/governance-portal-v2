/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Icon } from '@makerdao/dai-ui-icons';
import { Button, Flex, Text, ThemeUIStyleObject } from 'theme-ui';

type Props = { label: string; onClick: () => void; styles?: ThemeUIStyleObject; disabled?: boolean };

export const PlayButton = ({ label, onClick, styles, disabled }: Props): JSX.Element => (
  <Button variant="outline" sx={{ ...styles }} onClick={onClick} disabled={disabled}>
    <Flex sx={{ alignItems: 'center' }}>
      <Icon sx={{ mr: 2 }} name="play" size={3} />
      <Text color="text">{label}</Text>
    </Flex>
  </Button>
);
