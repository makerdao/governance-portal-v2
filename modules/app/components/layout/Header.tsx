import { useRouter } from 'next/router';
import { Flex, NavLink, Container, Close, Box, IconButton, Divider, Text } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import AccountSelect from './header/AccountSelect';
import BallotStatus from 'modules/polling/components/BallotStatus';
import { useState, useEffect } from 'react';
import { useBreakpointIndex } from '@theme-ui/match-media';
import ColorModeToggle from './header/ColorModeToggle';
import NetworkSelect from './header/NetworkSelect';
import { ErrorBoundary } from '../ErrorBoundary';
import { useAccount } from 'modules/app/hooks/useAccount';
import { InternalLink } from 'modules/app/components/InternalLink';
import { Menu, MenuButton, MenuItem, MenuList } from '@reach/menu-button';

const MenuItemContent = ({ label, icon }) => {
  return (
    <Flex sx={{ alignItems: 'center', gap: 2, justifyContent: 'flex-start' }}>
      <Icon name={icon} />
      <Text>{label}</Text>
    </Flex>
  );
};

const HeaderMenu = ({ ...props }): JSX.Element => {
  return (
    <Menu>
      <MenuButton
        sx={{
          variant: 'buttons.card',
          borderRadius: 'round',
          m: 'auto'
        }}
        {...props}
      >
        <Icon name="dots_h" />
      </MenuButton>
      <MenuList sx={{ variant: 'cards.compact', borderRadius: 'round', mt: 3, px: 0, py: 3 }}>
        <MenuItem
          onSelect={() => {}}
          sx={{
            variant: 'menubuttons.default.item'
          }}
        >
          <MenuItemContent icon="lock" label="10,233" />
        </MenuItem>
        <MenuItem
          onSelect={() => {}}
          sx={{
            variant: 'menubuttons.default.item'
          }}
        >
          <MenuItemContent icon="question_o" label="10,233" />
        </MenuItem>
        <MenuItem
          onSelect={() => {}}
          sx={{
            variant: 'menubuttons.default.item'
          }}
        >
          <MenuItemContent icon="discord" label="Support" />
        </MenuItem>
        <MenuItem
          onSelect={() => {}}
          sx={{
            variant: 'menubuttons.default.item'
          }}
        >
          <MenuItemContent icon="discord" label="Stats" />
        </MenuItem>
        <MenuItem
          onSelect={() => {}}
          sx={{
            variant: 'menubuttons.default.item'
          }}
        >
          <MenuItemContent icon="question_o" label="FAQs" />
        </MenuItem>
        <MenuItem
          onSelect={() => {}}
          sx={{
            variant: 'menubuttons.default.item'
          }}
        >
          <MenuItemContent icon="discord" label="Dark mode" />
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

const Header = (): JSX.Element => {
  const router = useRouter();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const bpi = useBreakpointIndex();
  const { account } = useAccount();

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
    >
      <Flex sx={{ flexDirection: 'row', alignItems: 'center' }}>
        <InternalLink href={'/'} title="View homepage">
          <IconButton aria-label="Maker home" sx={{ width: '40px', height: 4, p: 0 }}>
            <Icon name="maker" size="40px" color="ornament" sx={{ cursor: 'pointer' }} />
          </IconButton>
        </InternalLink>
        <Flex sx={{ ml: [0, 4, 4, 5] }}>
          <NavLink
            href={'/polling'}
            title="View polling page"
            p={0}
            sx={{
              display: ['none', 'block'],
              ml: [0, 4, 'auto'],
              color: router?.asPath?.startsWith('/polling') ? 'primary' : undefined
            }}
          >
            Polling
          </NavLink>

          <NavLink
            href={'/executive'}
            title="View executive page"
            p={0}
            sx={{
              display: ['none', 'block'],
              ml: [0, 4, 4, 5],
              color: router?.asPath?.startsWith('/executive') ? 'primary' : undefined
            }}
          >
            Executive
          </NavLink>

          <NavLink
            href={'/delegates'}
            title="View delegates page"
            p={0}
            sx={{
              display: ['none', 'block'],
              ml: [0, 4, 4, 5],
              color: router?.asPath?.startsWith('/delegates') ? 'primary' : undefined
            }}
          >
            Delegates
          </NavLink>

          <NavLink
            href={'/esmodule'}
            title="View emergency shutdown module page"
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
        </Flex>
      </Flex>
      <Flex sx={{ alignItems: 'center' }}>
        {bpi > 1 && (
          <Flex sx={{ pr: 2 }}>
            <ColorModeToggle />
          </Flex>
        )}

        {bpi > 3 && account && router.pathname.includes('polling') && <BallotStatus mr={3} />}
        {bpi > 1 && (
          <Flex mr={3}>
            <NetworkSelect />
          </Flex>
        )}
        {typeof window !== 'undefined' && (
          <ErrorBoundary componentName="Account Select">
            <AccountSelect />
          </ErrorBoundary>
        )}

        <IconButton
          aria-label="Show menu"
          ml="3"
          sx={{ display: [null, 'none'], height: '28px', width: '24px', p: 0 }}
          onClick={() => setShowMobileMenu(true)}
        >
          <Icon name="menu" sx={{ width: '18px' }} />
        </IconButton>
        {showMobileMenu && <MobileMenu hide={() => setShowMobileMenu(false)} router={router} />}
        <Flex sx={{ ml: 3 }}>
          <HeaderMenu />
        </Flex>
      </Flex>
    </Box>
  );
};

const MobileMenu = ({ hide, router }) => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      router.events.on('routeChangeComplete', hide);
    }
  }, []);

  return (
    <Container variant="modal">
      <Flex
        sx={{
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 2
        }}
      >
        <ColorModeToggle />
        <Flex>
          <NetworkSelect />
        </Flex>
        <Close sx={{ display: ['block'], '> svg': { size: [4] } }} onClick={hide} />
      </Flex>

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
        <NavLink href={'/'} title="View homepage">
          Home
        </NavLink>
        <Divider sx={{ width: '100%' }} />
        <NavLink href={'/polling'} title="View polling page">
          Polling
        </NavLink>
        <Divider sx={{ width: '100%' }} />
        <NavLink href={'/executive'} title="View executive page">
          Executive
        </NavLink>
        <Divider sx={{ width: '100%' }} />
        <NavLink href={'/delegates'} title="View delegates page">
          Delegates
        </NavLink>
        <Divider sx={{ width: '100%' }} />
        <NavLink href={'/esmodule'} title="View emergency shutdown module page">
          ES Module
        </NavLink>
      </Flex>
    </Container>
  );
};

export default Header;
