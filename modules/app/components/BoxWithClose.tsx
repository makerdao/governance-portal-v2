/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Box, Close } from 'theme-ui';

export const BoxWithClose = ({
  children,
  close,
  ...props
}: {
  children: React.ReactElement;
  close: () => void;
}): JSX.Element => (
  <Box sx={{ position: 'relative' }} {...props}>
    <Close
      aria-label="close"
      sx={{
        height: 4,
        width: 4,
        position: 'absolute',
        top: '-17px',
        right: '-17px',
        display: ['none', 'block'],
        outline: 'none'
      }}
      onClick={close}
    />
    {children}
  </Box>
);

export default BoxWithClose;
