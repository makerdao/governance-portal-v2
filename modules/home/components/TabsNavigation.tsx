import { useCallback, useEffect, useState } from 'react';
import { Box, Flex, Text } from 'theme-ui';

export default function TabsNavigation(): React.ReactElement {
  const [activeTab, setActiveTab] = useState('#vote');
  const hashChangeHandler = useCallback(() => {
    setActiveTab(window.location.hash);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', hashChangeHandler);
      return () => {
        window.removeEventListener('hashchange', hashChangeHandler);
      };
    }
  }, []);

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
        zIndex: 200
      }}
    >
      <Flex
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'secondaryMuted'
        }}
      >
        {links.map(link => {
          return (
            <Box
              key={`link-${link.href}`}
              sx={{
                ml: [2, 4],
                mr: [2, 4]
              }}
            >
              <a
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
                    borderColor: 'onBackground',
                    pb: 2,
                    pt: 1,
                    '&:hover': {
                      borderBottom: '1px solid'
                    }
                  }}
                >
                  <Text>{link.text}</Text>
                </Box>
              </a>
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
}
