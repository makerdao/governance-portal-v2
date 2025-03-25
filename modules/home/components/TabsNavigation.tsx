/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Box, Flex, Link, Text } from 'theme-ui';

export default function TabsNavigation({ activeTab }: { activeTab: string }): React.ReactElement {
  const links = [
    {
      href: '#vote',
      text: 'Vote'
    },
    {
      href: '#delegate',
      text: 'Delegate'
    },
    {
      href: '#learn',
      text: 'Learn'
    },
    {
      href: '#engage',
      text: 'Engage'
    }
  ];

  return (
    <Box
      sx={{
        backgroundColor: 'surface',
        backdropFilter: 'blur(50px)',
        zIndex: 200
      }}
    >
      <Flex
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'secondary'
        }}
      >
        {links.map(link => {
          return (
            <Box
              key={`link-${link.href}`}
              sx={{
                ml: [2, 4],
                mr: [2, 4],
                mb: '-1px'
              }}
            >
              <Link
                href={link.href}
                sx={{
                  textDecoration: 'none',
                  color: activeTab === link.href ? 'primary' : 'onSecondary',
                  '&:hover': {
                    color: 'primary'
                  }
                }}
              >
                <Box
                  sx={{
                    borderBottom: activeTab === link.href ? '1px solid' : 'none',
                    borderColor: activeTab === link.href ? 'primary' : 'textSecondary',
                    pb: 2,
                    pt: 1,
                    '&:hover': {
                      borderBottom: '1px solid',
                      borderColor: 'primary'
                    }
                  }}
                >
                  <Text>{link.text}</Text>
                </Box>
              </Link>
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
}
