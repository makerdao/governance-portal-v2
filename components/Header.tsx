/** @jsx jsx */
import Link from 'next/link';
import { Flex, NavLink, Container, Close, Box, IconButton, jsx } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';

import { getNetwork } from '../lib/maker';
import AccountSelect from './AccountSelect';
import BallotStatus from './BallotStatus';
import { useState } from 'react';
import { useBreakpointIndex } from '@theme-ui/match-media';
import useAccountsStore from '../stores/accounts';

const Header = (props): JSX.Element => {
  const network = getNetwork();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const bpi = useBreakpointIndex();
  const account = useAccountsStore(state => state.currentAccount);

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
      {...props}
    >
      <Link href={{ pathname: '/', query: { network } }}>
        <IconButton aria-label="Maker home" sx={{ width: 4, height: 4, p: 0 }}>
          <Icon name="maker" size="4" sx={{ cursor: 'pointer' }} />
        </IconButton>
      </Link>

      <IconButton
        aria-label="Maker home"
        ml="auto"
        sx={{ display: [null, null, null, 'none'], height: '28px', width: '24px', p: 0 }}
        onClick={() => setShowMobileMenu(true)}
      >
        <Icon name="menu" sx={{ height: '28px', width: '24px' }} />
      </IconButton>
      <Menu shown={showMobileMenu} hide={() => setShowMobileMenu(false)}>
        <Link href={{ pathname: '/', query: { network } }}>
          <NavLink p={2} sx={{ display: [null, null, null, 'none'] }}>
            Home
          </NavLink>
        </Link>
        <Link href={{ pathname: '/polling', query: { network } }}>
          <NavLink p={2}>Polling</NavLink>
        </Link>
        <Link href={{ pathname: '/executive', query: { network } }}>
          <NavLink p={2} sx={{ ml: [0, 0, 0, 5] }}>
            Executive
          </NavLink>
        </Link>
        <Link href={{ pathname: '/module', query: { network } }}>
          <NavLink p={2} sx={{ ml: [0, 0, 0, 5], mr: [0, 0, 0, 5] }}>
            ES Module
          </NavLink>
        </Link>
        {bpi > 2 && account && <BallotStatus mr={3} />}
        <AccountSelect />
      </Menu>
    </header>
  );
};

const Menu = ({ children, shown, hide }) => {
  return (
    <>
      <Box ml="auto" sx={{ alignItems: 'center', display: ['none', 'none', 'none', 'flex'] }}>
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
