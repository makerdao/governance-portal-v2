/** @jsx jsx */
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Flex, NavLink, Container, Close, Box, IconButton, jsx } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';

import { getNetwork } from '../lib/maker';
import AccountSelect from './header/AccountSelect';
import BallotStatus from './polling/BallotStatus';
import { useState, useEffect } from 'react';
import { useBreakpointIndex } from '@theme-ui/match-media';
import useAccountsStore from '../stores/accounts';

const Header = (props): JSX.Element => {
  const network = getNetwork();
  const router = useRouter();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const bpi = useBreakpointIndex();
  const account = useAccountsStore(state => state.currentAccount);

  return (
    <Box
      as="header"
      pt={3}
      pb={[4, 5]}
      px={[2, 0]}
      variant="styles.header"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%'
      }}
      {...props}
    >
      <Link href={{ pathname: '/', query: { network } }}>
        <IconButton aria-label="Maker home" sx={{ width: 4, height: 4, p: 0 }}>
          <Icon name="maker" size="4" sx={{ cursor: 'pointer' }} />
        </IconButton>
      </Link>
      <Flex sx={{ flexDirection: 'row', alignItems: 'center' }}>
        <Link href={{ pathname: '/polling', query: { network } }}>
          <NavLink
            href={`/polling?network=${network}`}
            p={0}
            sx={{ display: ['none', 'block'], ml: [0, 4, 'auto'] }}
          >
            Polling
          </NavLink>
        </Link>

        <Link href={{ pathname: '/executive', query: { network } }}>
          <NavLink
            href={`/executive?network=${network}`}
            p={0}
            sx={{ display: ['none', 'block'], ml: [0, 4, 4, 5], mr: [0, 'auto', 4, 5] }}
          >
            Executive
          </NavLink>
        </Link>

        {/* <Link href={{ pathname: '/module', query: { network } }}>
          <NavLink
            href={`/module?network=${network}`}
            p={0}
            sx={{ display: ['none', 'block'], ml: [0, 4, 4, 5], mr: [0, 'auto', 4, 5] }}
          >
            ES Module
          </NavLink>
        </Link> */}

        {bpi > 1 && account && router.pathname.includes('polling') && <BallotStatus mr={3} />}
        <AccountSelect sx={{ ml: ['auto', 3, 0] }} />

        <IconButton
          aria-label="Show menu"
          ml="3"
          sx={{ display: [null, 'none'], height: '28px', width: '24px', p: 0 }}
          onClick={() => setShowMobileMenu(true)}
        >
          <Icon name="menu" sx={{ width: '18px' }} />
        </IconButton>
        {showMobileMenu && (
          <MobileMenu hide={() => setShowMobileMenu(false)} router={router} {...{ network }} />
        )}
      </Flex>
    </Box>
  );
};

const MobileMenu = ({ hide, network, router }) => {
  useEffect(() => {
    router.events.on('routeChangeComplete', hide);
  }, []);

  return (
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
        <Link href={{ pathname: '/', query: { network } }}>
          <NavLink>Home</NavLink>
        </Link>
        <Link href={{ pathname: '/polling', query: { network } }}>
          <NavLink>Polling</NavLink>
        </Link>
        <Link href={{ pathname: '/executive', query: { network } }}>
          <NavLink>Executive</NavLink>
        </Link>
        {/* <Link href={{ pathname: '/module', query: { network } }}>
          <NavLink>ES Module</NavLink>
        </Link> */}
      </Flex>
    </Container>
  );
};

export default Header;
