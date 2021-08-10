/** @jsx jsx */

import React, { useContext } from 'react';

import Link from 'next/link';
import { Box, Button, Flex, jsx, Text, Label, Checkbox } from 'theme-ui';
import { CookiesContext } from 'lib/client/cookies/CookiesContext';

export default function Cookies(): React.ReactElement | null {
  const { accepted, accept, cookies, setCookies, loaded } = useContext(CookiesContext);

  const onClickAccept = () => {
    accept(cookies);
  };

  const onClickReject = () => {
    accept({
      functional: false,
      statistics: false
    });
  };

  return !accepted && loaded ? (
    <Box
      sx={{
        position: 'fixed',
        height: '100vh',
        background: 'rgba(0,0,0,0.3)',
        width: '100vw',
        top: '0',
        zIndex: '100',
        left: '0'
      }}
    >
      <Box
        sx={{
          position: 'fixed',
          bottom: '0',
          width: '100%',
          backgroundColor: 'background',
          padding: 4,
          border: '1px solid',
          borderColor: 'secondaryMuted',
          borderRadius: 'medium'
        }}
      >
        <Text
          as="p"
          sx={{ maxWidth: '550px', textAlign: 'center', margin: '0 auto', mb: 2, fontSize: '13px' }}
        >
          This website uses cookies for analytic purposes only. Cookies are anonymous and do not link to user
          data. We collect information to improve the governance experience and validate UI changes. You can
          still use the page without cookies. For more information, please read our{' '}
          <Link href="/cookies-policy">
            <a title="cookies policy"> cookies policy</a>
          </Link>
          .
        </Text>

        <Flex
          sx={{
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2
          }}
        >
          <Box sx={{ mr: 2 }}>
            <Label>
              <Text sx={{ fontSize: 2, mr: 1 }}>Functional Cookies</Text>
              <Checkbox
                type="checkbox"
                checked={cookies.functional}
                onClick={() => {
                  setCookies({ ...cookies, functional: !cookies.functional });
                }}
              />
            </Label>
          </Box>
          <Box sx={{ ml: 2 }}>
            <Label>
              <Text sx={{ fontSize: 2, mr: 1 }}>Analytics cookies</Text>
              <Checkbox
                type="checkbox"
                checked={cookies.statistics}
                onClick={() => {
                  setCookies({ ...cookies, statistics: !cookies.statistics });
                }}
              />
            </Label>
          </Box>
        </Flex>

        <Flex
          sx={{
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2
          }}
        >
          <Box sx={{ mr: 2 }}>
            <Button title="Accept cookies" onClick={onClickAccept}>
              Accept configured cookies
            </Button>
          </Box>
          <Box sx={{ mr: 2 }}>
            <Button title="Reject all cookies" variant="outline" onClick={onClickReject}>
              Reject all cookies
            </Button>
          </Box>
        </Flex>
      </Box>
    </Box>
  ) : null;
}
