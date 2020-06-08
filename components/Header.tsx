/** @jsx jsx */
import Link from 'next/link';
import { Flex, NavLink, Container, Close, Box, IconButton, MenuButton, jsx } from 'theme-ui';
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
        pt: 3,
        mb: 3,
        display: 'flex',
        alignItems: 'center',
        variant: 'styles.header'
      }}
    >
      <Link href={{ pathname: '/', query: { network } }}>
        <IconButton aria-label="Maker home" sx={{ width: 5 }}>
          <Icon name="maker" size="5" sx={{ cursor: 'pointer' }} />
        </IconButton>
      </Link>

      <Icon
        name="menu"
        size="24px"
        sx={{ cursor: 'pointer', display: [null, 'none'] }}
        ml="auto"
        onClick={() => setShowMobileMenu(true)}
      />
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
        <Link href={{ pathname: '/esmodule', query: { network } }}>
          <NavLink p={2}>ES Module</NavLink>
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
          <Close mt="auto" sx={{ display: ['block'], '> svg': { size: [4] } }} onClick={hide} />
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
