/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { ExternalLink } from 'modules/app/components/ExternalLink';
import Banner from 'modules/app/components/layout/header/Banner';
import { Box, Flex, Text } from 'theme-ui';
import Icon from 'modules/app/components/Icon';
import { useEffect, useState } from 'react';
import { localStorage } from 'modules/app/client/storage/localStorage';

export default function GaslessBanner(): React.ReactElement {
  const [bannerVisible, setBannerVisible] = useState(false);

  useEffect(() => {
    const prevState = localStorage && localStorage.get('gasless-banner', true);
    if (!prevState && typeof window !== 'undefined') {
      setBannerVisible(true);
    }
  }, []);

  const onClose = () => {
    setBannerVisible(false);
    localStorage.set(
      'gasless-banner',
      JSON.stringify({
        time: Date.now()
      })
    );
  };
  return (
    <Box>
      {bannerVisible && (
        <Banner
          variant={'primary'}
          content={
            <Flex sx={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
              <Flex sx={{ justifyContent: 'center', width: '100%' }}>
                <ExternalLink
                  href="https://manual.makerdao.com/governance/voting-in-makerdao/gasless-poll-voting"
                  title="Learn more about gasless voting"
                  styles={{ color: 'inherit' }}
                >
                  <Text sx={{ display: 'flex', alignItems: 'center' }}>
                    <Icon name="lightningBolt" size={3} sx={{ mr: 1 }} /> Poll voting is now gasless!&nbsp;
                    <b>Learn more</b>
                    <Icon name="chevron_right" size={2} sx={{ ml: 2 }} />
                  </Text>
                </ExternalLink>
              </Flex>
              <Box onClick={onClose}>
                <Icon name="close" size={2} sx={{ cursor: 'pointer' }} />
              </Box>
            </Flex>
          }
        />
      )}
    </Box>
  );
}
