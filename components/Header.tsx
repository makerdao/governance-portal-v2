/** @jsx jsx */
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Flex, NavLink, Container, Close, Box, IconButton, jsx, Divider } from 'theme-ui';
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
        <IconButton aria-label="Maker home" sx={{ width: '40px', height: 4, p: 0 }}>
          <Icon name="maker" size="40px" sx={{ cursor: 'pointer' }} />
        </IconButton>
      </Link>
      <Flex sx={{ flexDirection: 'row', alignItems: 'center' }}>
        <Link href={{ pathname: '/polling', query: { network } }} passHref>
          <NavLink
            title="Polling"
            p={0}
            sx={{
              display: ['none', 'block'],
              ml: [0, 4, 'auto'],
              color: router?.asPath?.startsWith('/polling') ? 'primary' : undefined
            }}
          >
            Polling
          </NavLink>
        </Link>

        <Link href={{ pathname: '/executive', query: { network } }} passHref>
          <NavLink
            p={0}
            title="Executive"
            sx={{
              display: ['none', 'block'],
              ml: [0, 4, 4, 5],
              color: router?.asPath?.startsWith('/executive') ? 'primary' : undefined
            }}
          >
            Executive
          </NavLink>
        </Link>

        <Link href={{ pathname: '/delegates', query: { network } }} passHref>
          <NavLink
            title="Delegates"
            p={0}
            sx={{
              display: ['none', 'block'],
              ml: [0, 4, 4, 5],
              color: router?.asPath?.startsWith('/delegates') ? 'primary' : undefined
            }}
          >
            Delegates
          </NavLink>
        </Link>

        <Link href={{ pathname: '/esmodule', query: { network } }} passHref>
          <NavLink
            title="ES Module"
            p={0}
            sx={{
              display: ['none', 'block'],
              ml: [0, 4, 4, 5],
              mr: [0, 'auto', 4, 5],
              color: router?.asPath?.startsWith('/esmodule') ? 'primary' : undefined
            }}
          >
            ES Module
          </NavLink>
        </Link>

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
          mt: 4,
          justifyContent: 'space-between',
          height: '40vh',
          '> a': {
            fontSize: 6
          }
        }}
      >
        <Link href={{ pathname: '/', query: { network } }}>
          <NavLink>Home</NavLink>
        </Link>
        <Divider sx={{ width: '100%' }} />
        <Link href={{ pathname: '/polling', query: { network } }}>
          <NavLink>Polling</NavLink>
        </Link>
        <Divider sx={{ width: '100%' }} />
        <Link href={{ pathname: '/executive', query: { network } }}>
          <NavLink>Executive</NavLink>
        </Link>
        <Divider sx={{ width: '100%' }} />
        <Link href={{ pathname: '/esmodule', query: { network } }}>
          <NavLink>ES Module</NavLink>
        </Link>
      </Flex>
    </Container>
  );
};

export default Header;
