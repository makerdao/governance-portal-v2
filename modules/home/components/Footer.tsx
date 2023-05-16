/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Box, Flex, Text, useColorMode } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { ExternalLink } from 'modules/app/components/ExternalLink';
import React, { useState, useEffect } from 'react';
import { translate } from '@makerdao/i18n-helper';
import { useBreakpointIndex } from '@theme-ui/match-media';

const ContactSection = ({ heading, logos, icon }) => {
  return (
    <Flex sx={{ flexDirection: 'column', gap: 2 }}>
      <Text as="h4" sx={{ fontSize: 3, fontWeight: 'semiBold' }}>
        {heading}
      </Text>
      <Flex
        sx={{
          alignItems: 'center',
          '& svg': {
            width: 20,
            height: 20,
            transition: 'opacity 0.2s',
            cursor: 'pointer',
            opacity: 0.8,
            marginRight: 24,
            ':hover': {
              opacity: 1
            }
          }
        }}
      >
        {logos.map(({ title, url, icon, styles }) => (
          <ExternalLink key={title} styles={{ color: 'text', ...styles }} href={url} title={title}>
            <Icon name={icon} />
          </ExternalLink>
        ))}
      </Flex>
      <Icon name={icon} size={4} sx={{ my: [0, 0, 4] }} />
    </Flex>
  );
};

export default function Footer({ locale = 'en' }: { locale?: string }): React.ReactElement {
  const bpi = useBreakpointIndex();
  const [mode] = useColorMode();
  const [renderedMode, setRenderedMode] = useState('light');

  useEffect(() => {
    setRenderedMode(mode);
  }, [mode]);

  const t = text => translate(text, locale);

  const links = [
    {
      header: t('Governance'),
      list: [
        {
          url: 'https://forum.makerdao.com/',
          title: t('Forum')
        },
        {
          url: 'https://manual.makerdao.com/',
          title: t('Operational Manual')
        },
        {
          url: 'https://makerdao.world/en/learn/governance/',
          title: t('Governance FAQs')
        },
        {
          url: 'https://docs.google.com/spreadsheets/d/1LWNlv6hr8oXebk8rvXZBPRVDjN-3OrzI0IgLwBVk0vM/edit#gid=0',
          title: t('Gov Tracking Sheet')
        },
        {
          url: 'https://manual.makerdao.com/governance/governance-cycle/monthly-governance-cycle',
          title: t('Monthly Gov Cycle')
        },
        {
          url: 'https://manual.makerdao.com/governance/governance-cycle/weekly-governance-cycle',
          title: t('Weekly Gov Cycle')
        }
      ]
    },
    {
      header: t('Products & Tools'),
      list: [
        {
          url: 'https://makerdao.statuspage.io/',
          title: t('Service Status')
        },

        {
          url: 'https://auctions.makerdao.network/',
          title: t('Auctions Dashboard')
        },
        {
          url: 'https://migrate.makerdao.com/',
          title: t('Migrate Dashboard')
        },
        {
          url: 'https://makerburn.com/',
          title: t('MakerBurn')
        },
        {
          url: 'https://daistats.com/',
          title: t('DAI Stats')
        },
        {
          url: 'https://vote.makerdao.com/terms',
          title: t('Terms')
        }
      ]
    },
    {
      header: t('Developer'),
      list: [
        {
          url: 'https://makerdao.com/whitepaper',
          title: t('Whitepaper')
        },
        {
          url: 'https://docs.makerdao.com/',
          title: t('Technical Docs')
        },
        {
          url: 'https://vote.makerdao.com/api-docs',
          title: t('API Docs')
        },
        {
          url: 'https://github.com/makerdao/developerguides',
          title: t('Developer Guides')
        },
        {
          url: 'https://www.notion.so/makerdao/Maker-Brand-ac517c82ff9a43089d0db5bb2ee045a4',
          title: t('Brand Assets')
        }
      ]
    }
  ];

  const logos = {
    makerdao: [
      { title: 'Discord', url: 'https://chat.makerdao.com', icon: 'discord' },
      { title: 'Twitter', url: 'https://twitter.com/MakerDAO', icon: 'twitter' },
      { title: 'Reddit', url: 'https://www.reddit.com/r/MakerDAO/', icon: 'reddit' },
      { title: 'YouTube', url: 'https://www.youtube.com/MakerDAO', icon: 'youtube' },
      { title: 'GitHub', url: 'https://www.github.com/makerdao', icon: 'github' }
    ],
    makerdux: [
      { title: 'Discord', url: 'https://discord.gg/GHcFMdKden', icon: 'discord' },
      { title: 'Twitter', url: 'https://twitter.com/MakerDUX', icon: 'twitter' },
      { title: 'GitHub', url: 'https://github.com/makerdao/governance-portal-v2', icon: 'github' },
      { title: 'Canny', url: 'https://makergovernance.canny.io/', icon: 'canny' },
      { title: 'Immunefi', url: 'https://immunefi.com/bounty/makerdao/', icon: 'immunefi' }
    ]
  };

  const mobile = bpi <= 1;
  return (
    <Box sx={{ position: 'relative', mt: 4 }}>
      <Box
        sx={{
          width: '100vw',
          height: '100%',
          left: '50%',

          zIndex: -1,
          position: 'absolute',
          transform: 'translateX(-50%)',
          backgroundImage:
            renderedMode === 'dark'
              ? bpi <= 2
                ? 'url(/assets/bg_dark_medium.jpeg)'
                : 'url(/assets/bg_footer_dark.jpeg)'
              : bpi <= 2
              ? 'url(/assets/bg_medium.jpeg)'
              : 'url(/assets/bg_footer_light.jpeg)',
          backgroundSize: ['1500px', '1500px', '1500px', '100% 600px', '100% 400px'],
          backgroundRepeat: 'no-repeat',
          backgroundPosition: ['-750px 100%', '-750px 100%', '-750px 100%', 'bottom', 'bottom']
        }}
      />
      <Flex
        as="footer"
        sx={{
          justifyContent: 'space-between',
          gap: 4,
          width: '100%',
          flexDirection: mobile ? 'column' : 'row',
          pt: 4,
          pb: 5
        }}
      >
        <ContactSection heading="Official Community Channels" icon="maker" logos={logos.makerdao} />
        <Flex
          sx={{
            justifyContent: 'space-between',
            gap: [4, 2, 5],
            width: ['100%', '100%', 'initial'],
            flexWrap: ['wrap', 'nowrap']
          }}
        >
          {links.map(group => {
            return (
              <Flex key={group.header} sx={{ flexDirection: 'column', gap: 2, minWidth: ['45%', 'initial'] }}>
                <Text as="h4" sx={{ fontSize: 3, fontWeight: 'semiBold' }}>
                  {group.header}
                </Text>
                {group.list.map(({ url, title }) => {
                  return (
                    <ExternalLink
                      key={title}
                      href={url}
                      title={title}
                      styles={{ fontSize: [1, 2], color: 'text' }}
                    >
                      <Text>{title}</Text>
                    </ExternalLink>
                  );
                })}
              </Flex>
            );
          })}
        </Flex>
        <ContactSection heading="Development & UX Channels" icon="makerdux" logos={logos.makerdux} />
      </Flex>
    </Box>
  );
}
