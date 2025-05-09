/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Text, Alert, Box } from 'theme-ui';
import { keyframes } from '@emotion/react';
import React from 'react';
import { SkyUpgradeBanner } from '../../SkyUpgradeBanner';

const scroll = keyframes({
  from: { transform: 'translate(100vw, 0)' },
  to: { transform: 'translate(-100%, 0)' }
});

export const AppBanner = (): React.ReactElement | null => {
  // Logic to determine active banner can be added here in the future.
  // For now, it always shows SkyUpgradeBanner if it's considered active.
  const isSkyUpgradeBannerActive = false;

  if (!isSkyUpgradeBannerActive) {
    return null;
  }

  return (
    <Box sx={{ pb: 3 }}>
      <Alert
        variant="alerts.primary"
        sx={{
          fontSize: 2,
          borderRadius: 0,
          fontWeight: 'normal',
          textAlign: 'center',
          px: 3,
          py: 2,
          overflow: 'hidden' // Important to hide content that scrolls out of view
        }}
      >
        <Text
          as="p"
          sx={{
            color: 'white',
            display: 'inline-block', // Necessary for transform to work correctly with text
            whiteSpace: 'nowrap', // Keep the banner content on a single line
            animation: `${scroll} 30s linear infinite`
          }}
        >
          <SkyUpgradeBanner />
        </Text>
      </Alert>
    </Box>
  );
};
