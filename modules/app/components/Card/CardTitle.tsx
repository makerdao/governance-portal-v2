/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Text, ThemeUIStyleObject } from 'theme-ui';

type Props = {
  title: string;
  styles?: ThemeUIStyleObject;
  dataTestId?: string;
  onVisit?: () => void;
};

export const CardTitle = ({ title, styles, dataTestId = 'card-title', onVisit }: Props): JSX.Element => (
  <Text
    as="h3"
    variant="microHeading"
    data-testid={dataTestId}
    sx={{ fontSize: [3, 5], mt: 2, ...styles }}
    onClick={() => onVisit?.()}
  >
    {title}
  </Text>
);
