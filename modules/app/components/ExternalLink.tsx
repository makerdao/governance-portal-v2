/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Link as ThemeUILink, ThemeUIStyleObject } from 'theme-ui';

type Props = {
  href: string;
  title: string;
  children: JSX.Element;
  styles?: ThemeUIStyleObject;
};

export const ExternalLink = ({ href, title, children, styles }: Props): JSX.Element => {
  return (
    <ThemeUILink
      href={href}
      title={title}
      target="_blank"
      rel="noreferrer"
      sx={{
        ...styles
      }}
    >
      {children}
    </ThemeUILink>
  );
};
