import Link from 'next/link';
import Router from 'next/router';
import { Flex, Heading, NavLink, Button, Container, Box } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';

import { getNetwork } from '../lib/maker';
import AccountSelect from './AccountSelect';
import { useState } from 'react';

const Header: React.FC = () => {
  const network = getNetwork();
  const otherNetwork = network === 'mainnet' ? 'kovan' : 'mainnet';
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <Flex as="header" variant="styles.header" my={3} sx={{ alignItems: 'center' }}>
      <Link href={{ pathname: '/', query: { network } }}>
        <Heading as="h1" sx={{ cursor: 'pointer' }}>
          <Icon name="maker" size="4" sx={{ cursor: 'pointer' }} />
        </Heading>
      </Link>

      <Icon
        name="menu"
        size="24px"
        sx={{ cursor: 'pointer', display: [null, 'none'] }}
        ml="auto"
        onClick={() => setShowMobileMenu(true)}
      />
      <Menu shown={showMobileMenu} hide={() => setShowMobileMenu(false)}>
        <Button
          variant="outline"
          onClick={() => {
            if (Router?.router) {
              Router.push({
                pathname: Router.router.pathname,
                query: { network: otherNetwork }
              });
            }
          }}
        >
          Switch to {otherNetwork}
        </Button>
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
    </Flex>
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
          <Icon
            name="close"
            size="32px"
            sx={{ cursor: 'pointer', ml: 'auto', display: 'block' }}
            onClick={hide}
          />
          <Flex
            sx={{
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              height: '50vh'
            }}
            css={'> a { font-size: 32px }'}
          >
            {children}
          </Flex>
        </Container>
      )}
    </>
  );
};

export default Header;
