/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Text, Alert } from 'theme-ui';
import { keyframes } from '@emotion/react';
import { ExternalLink } from '../../ExternalLink';
import React from 'react';
import { Icon } from '@makerdao/dai-ui-icons';

const scroll = keyframes({
  from: { transform: 'translate(60vw, 0)' },
  to: { transform: 'translate(-60vw, 0)' }
});

const Banner = ({
  content,
  variant = 'banner',
  href
}: {
  content: string | React.ReactElement;
  variant?: string;
  href?: string;
}): React.ReactElement => {
  const Link = href ? ExternalLink : React.Fragment;
  const arrow = href ? <Icon name="chevron_right" size={2} ml={2} /> : null;
  const linkProps = href ? { href, title: '', color: 'white' } : {};
  return (
    <Alert
      variant={variant}
      sx={{
        fontSize: 2,
        borderRadius: 0,
        fontWeight: 'normal',
        textAlign: 'center',
        px: 3,
        py: 2
      }}
    >
      {typeof content === 'string' ? (
        <Link {...linkProps}>
          <Text
            as="p"
            sx={{
              animation: `${scroll} 30s linear infinite`,
              color: href ? 'white' : undefined
            }}
          >
            {content} {arrow}
          </Text>
        </Link>
      ) : (
        content
      )}
    </Alert>
  );
};

export default Banner;
