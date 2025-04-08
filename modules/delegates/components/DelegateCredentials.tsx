/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Box, Link as ExternalLink, Text } from 'theme-ui';
import Icon from 'modules/app/components/Icon';

import { Delegate } from '../types';

export function DelegateCredentials({ delegate }: { delegate: Delegate }): React.ReactElement {
  return (
    <Box>
      <Box p={[3, 4]}>
        <Box
          sx={{ variant: 'markdown.default' }}
          dangerouslySetInnerHTML={{ __html: delegate.description }}
        />

        {delegate.externalUrl && (
          <Box sx={{ mt: 2 }}>
            <ExternalLink title="See external profile" href={delegate.externalUrl} target="_blank">
              <Text sx={{ fontSize: [1, 3] }}>
                See external profile
                <Icon sx={{ ml: 2 }} name="arrowTopRight" size={2} />
              </Text>
            </ExternalLink>
          </Box>
        )}
      </Box>
    </Box>
  );
}
