/** @jsx jsx */
import { Flex, Grid, Box, Container, jsx, Text} from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';

import React from 'react';
import { translate } from '@makerdao/i18n-helper';
import Link from 'next/link';

export default function LongFooter({ locale = 'en' }: { locale?: string }): React.ReactElement {
 
  const t = text => translate(text, locale);

  const links = [
    {
      header: t('Resources'),
      list: [
        {
          url: 'https://makerdao.com/whitepaper',
          title: t('Whitepaper')
        },
        {
          url: 'https://awesome.makerdao.com/#faqs',
          title: t('FAQs')
        },
        {
          url: 'https://makerdao.com/privacy',
          title: t('Privacy Policy')
        },
        {
          url: 'https://www.notion.so/makerdao/Maker-Brand-ac517c82ff9a43089d0db5bb2ee045a4',
          title: t('Brand Assets')
        },
        {
          url: 'https://makerdao.com/en/feeds/',
          title: t('Feeds')
        },
        {
          url: 'https://makerdao.statuspage.io/',
          title: t('Service Status')
        }
      ]
    },
    {
      header: t('Products'),
      list: [
        {
          url: 'https://oasis.app/',
          title: t('Whitepaper')
        },
        {
          url: 'https://migrate.makerdao.com/',
          title: t('Migrate')
        },
        {
          url: 'https://makerdao.com/en/ecosystem/',
          title: t('Ecosystem')
        },
        {
          url: 'https://makerdao.com/en/governance/',
          title: t('Governance')
        }
      ]
    },
    {
      header: t('Developers'),
      list: [
        {
          url: 'https://docs.makerdao.com/',
          title: t('Documentation')
        },
        {
          url: 'https://docs.makerdao.com/dai.js',
          title: 'Dai.js'
        },
        {
          url: 'https://docs.makerdao.com/',
          title: t('Documentation')
        },
        {
          url: 'https://github.com/makerdao/developerguides',
          title: 'Developer Guides'
        }
      ]
    },
    {
      header: t('Foundation'),
      list: [
        {
          url: 'https://makerdao.com/contact',
          title: t('Contact')
        }
      ]
    }
  ];

  return (
    <Container
      as="footer"
      sx={{
        px: [4, 0, 0],
        fontSize: '1.5rem',
        pt: 5,
        pb: 3,
        width: '100%',
        backgroundColor: '#FFFFFF'
      }}
    >
      <Grid
        sx={{ maxWidth: 'page' }}
        m="0 auto"
        columns={['1fr', '1fr 1fr', '1fr 1fr', 'repeat(4, 1fr) auto']}
        gap="2rem"
      >
        {links.map(group => (
          <div key={group.header}>
            <Box
              as="div"
              sx={{
                fontWeight: '500',
                marginBottom: '0.2rem',
                color: 'black',
                fontSize: 14.3
              }}
            >
              {group.header}
            </Box>
            <Box
              as="ul"
              sx={{
                paddingLeft: 0,
                listStyle: 'none',
                lineHeight: '2.1rem',
                fontSize: 14,
                '& a': {
                  color: 'footerText',
                  fontWeight: '400',
                  transition: 'color 0.2s ease-out',
                  textDecoration: 'none',
                  ':hover': { color: 'greenLinkHover' }
                }
              }}
            >
              {group.list.map(link => (
                <li key={link.url}>
                  <a href={link.url} title={link.title} target="_blank" rel="noreferrer">
                    {link.title}
                  </a>
                </li>
              ))}
            </Box>
          </div>
        ))}

        <Box >
          
          <Flex
            mt="1.8rem"
            sx={{
              flexDirection: 'row',
              justifyContent: 'left',
              marginTop: 22,
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
            <Link href="https://twitter.com/MakerDAO">
              <Icon name="twitter" />
            </Link>
            <Link href="https://www.reddit.com/r/MakerDAO/">
              <Icon name="reddit" />
            </Link>
            <Link href="https://t.me/makerdaoOfficial">
              <Icon name="telegram" />
            </Link>
            <Link href="https://chat.makerdao.com/">
              <Icon name="rocket_chat" />
            </Link>
            <Link href="https://www.youtube.com/MakerDAO">
              <Icon name="youtube" />
            </Link>
          </Flex>
        </Box>
      </Grid>
    </Container>
  );
}
