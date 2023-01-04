/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Text, ThemeUIStyleObject } from 'theme-ui';

type Props = {
  text: string;
  styles?: ThemeUIStyleObject;
};

export const CardSummary = ({ text, styles }: Props): JSX.Element => (
  <Text
    as="p"
    variant="secondary"
    sx={{
      ...styles
    }}
  >
    {text}
  </Text>
);
