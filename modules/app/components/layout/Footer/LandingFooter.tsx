import { Flex, Text, useColorMode } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { ExternalLink } from 'modules/app/components/ExternalLink';
import React, { useEffect, useState } from 'react';
import { translate } from '@makerdao/i18n-helper';
import { useBreakpointIndex } from '@theme-ui/match-media';

const ContactSection = ({ heading, title, logos, icon }) => {
  return (
    <Flex sx={{ flexDirection: 'column', gap: 2 }}>
      <Text as="h4" sx={{ fontSize: 3, fontWeight: 'semiBold' }}>
        {heading}
      </Text>
      <Text sx={{ fontSize: 3, fontWeight: 'semiBold', color: 'footerText' }}>{title}</Text>
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

export default function LongFooter({ locale = 'en' }: { locale?: string }): React.ReactElement {
  const bpi = useBreakpointIndex();
  const [mode] = useColorMode();
  const [backgroundImage, setBackroundImage] = useState('url(/assets/bg_medium.jpeg)');

  useEffect(() => {
    setBackroundImage(mode === 'dark' ? 'url(/assets/bg_dark_medium.jpeg)' : 'url(/assets/bg_medium.jpeg)');
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
          url: 'https://oasis.app/',
          title: t('Oasis')
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
        },
        {
          url: 'https://makerdao.com/en/feeds/',
          title: t('Oracle Feeds')
        }
      ]
    }
  ];

  const logos = {
    makerdao: [
      { title: 'Discord', url: 'https://chat.makerdao.com', icon: 'discord' },
      { title: 'Twitter', url: 'https://twitter.com/MakerDAO', icon: 'twitter' },
      { title: 'Reddit', url: 'https://www.reddit.com/r/MakerDAO/', icon: 'reddit' },
      { title: 'Telegram', url: 'https://t.me/makerdaoOfficial', icon: 'telegram' },
      { title: 'YouTube', url: 'https://www.youtube.com/MakerDAO', icon: 'youtube' },
      { title: 'GitHub', url: 'https://www.github.com/makerdao', icon: 'github' }
    ],
    makerdux: [
      { title: 'Discord', url: 'https://discord.gg/GHcFMdKden', icon: 'discord' },
      { title: 'Twitter', url: 'https://twitter.com/MakerDUX', icon: 'twitter' },
      { title: 'GitHub', url: 'https://github.com/makerdao/governance-portal-v2', icon: 'github' },
      { title: 'Canny', url: 'https://makergovernance.canny.io/', icon: 'canny' },
      { title: 'Immunifi', url: 'https://immunefi.com/bounty/makerdao/', icon: 'immunifi' }
    ]
  };

  const mobile = bpi <= 1;
  return (
    <div sx={{ position: 'relative' }}>
      <div
        sx={{
          pt: ['200%', '100%'],
          width: ['200%', '100%'],
          zIndex: -1,
          position: 'absolute',
          transform: mobile ? 'scale(1.5)' : 'rotate(21deg)',
          right: [-200, undefined],
          backgroundImage,
          backgroundSize: [undefined, '100%'],
          backgroundRepeat: 'no-repeat',
          backgroundPosition: mobile ? 'center bottom' : undefined
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
        <ContactSection
          heading="Contact MakerDAO"
          title="Official Community Channels"
          icon="maker"
          logos={logos.makerdao}
        />
        <Flex
          sx={{
            justifyContent: 'space-between',
            gap: [4, 2, 5],
            width: ['100%', '100%', 'initial'],
            flexWrap: 'wrap'
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
                    <ExternalLink key={title} href={url} title={title} styles={{ fontSize: [1, 2] }}>
                      <Text sx={{ fontSize: 3, color: 'footerText' }}>{title}</Text>
                    </ExternalLink>
                  );
                })}
              </Flex>
            );
          })}
        </Flex>
        <ContactSection
          heading="Contact MakerDUX for support"
          title={'Development & UX Core Unit'}
          icon="makerdux"
          logos={logos.makerdux}
        />
      </Flex>
    </div>
  );
}
