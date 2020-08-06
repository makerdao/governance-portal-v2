/** @jsx jsx */
import Link from 'next/link';
import { Flex, NavLink, Container, Close, Box, IconButton, jsx } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';

import { getNetwork } from '../lib/maker';
import AccountSelect from './AccountSelect';
import { useState } from 'react';

const Header = () => {
  const network = getNetwork();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <header
      sx={{
        py: 3,
        px: [3, 0],
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        variant: 'styles.header'
      }}
    >
      <Link href={{ pathname: '/', query: { network } }}>
        <IconButton aria-label="Maker home" sx={{ width: 4, height: 4, p: 0 }}>
          <Icon name="maker" size="4" sx={{ cursor: 'pointer' }} />
        </IconButton>
      </Link>

      <IconButton
        aria-label="Maker home"
        ml="auto"
        sx={{ display: [null, 'none'], height: '28px', width: '24px', p: 0 }}
        onClick={() => setShowMobileMenu(true)}
      >
        <Icon name="menu" sx={{ height: '28px', width: '24px' }} />
      </IconButton>
      <Menu shown={showMobileMenu} hide={() => setShowMobileMenu(false)}>
        <Link href={{ pathname: '/', query: { network } }}>
          <NavLink p={2} sx={{ display: [null, 'none'] }}>
            Home
          </NavLink>
        </Link>
        <Link href={{ pathname: '/polling', query: { network } }}>
          <NavLink p={2}>Polling</NavLink>
        </Link>
        <Link href={{ pathname: '/executive', query: { network } }}>
          <NavLink p={2}>Executive</NavLink>
        </Link>
        <Link href={{ pathname: '/module', query: { network } }}>
          <NavLink p={2}>Module</NavLink>
        </Link>
        <AccountSelect />
      </Menu>
    </header>
  );
};

const Menu = ({ children, shown, hide }) => {
  return (
    <>
      <Box ml="auto" sx={{ alignItems: 'center', display: ['none', 'flex'] }}>
        {children}
      </Box>
      {shown && (
        <Container variant="modal">
          <Close ml="auto" sx={{ display: ['block'], '> svg': { size: [4] } }} onClick={hide} />
          <Flex
            sx={{
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              height: '50vh',
              '> a': {
                fontSize: 7
              }
            }}
          >
            {children}
          </Flex>
        </Container>
      )}
    </>
  );
};

export default Header;
