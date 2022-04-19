import { useRouter } from 'next/router';
import { Flex, NavLink, Container, Close, Box, IconButton, Divider, Text, useColorMode } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import AccountSelect from './header/AccountSelect';
import BallotStatus from 'modules/polling/components/BallotStatus';
import { useState, useEffect } from 'react';
import { useBreakpointIndex } from '@theme-ui/match-media';
import NetworkSelect from './header/NetworkSelect';
import { ErrorBoundary } from '../ErrorBoundary';
import { useAccount } from 'modules/app/hooks/useAccount';
import { InternalLink } from 'modules/app/components/InternalLink';
import { Menu, MenuButton, MenuItem, MenuList } from '@reach/menu-button';
import { useTokenBalance } from 'modules/web3/hooks/useTokenBalance';
import { Tokens } from 'modules/web3/constants/tokens';
import { useContractAddress } from 'modules/web3/hooks/useContractAddress';
import { formatValue } from 'lib/string';
import { useGasPrice } from 'modules/web3/hooks/useGasPrice';
import { ExternalLink } from '../ExternalLink';

const MenuItemContent = ({ label, icon }) => {
  return (
    <Flex sx={{ alignItems: 'center', gap: 2, justifyContent: 'flex-start' }}>
      <Icon name={icon} size={'auto'} sx={{ height: '20px', width: '20px' }} />
      {typeof label === 'function' ? { label } : <Text>{label}</Text>}
    </Flex>
  );
};

const HeaderMenu = ({ mkrInChief, gas, ...props }): JSX.Element => {
  const [mode, setMode] = useColorMode();

  const onToggleTheme = () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    const html = document.getElementsByTagName('html');
    if (html) html[0].style.colorScheme = next;
    setMode(next);
  };
  return (
    <Menu>
      <MenuButton
        sx={{
          variant: 'buttons.card',
          borderRadius: 'round',
          height: '37px',
          width: '37px',
          display: 'flex',
          justifyContent: 'center',
          color: 'textSecondary',
          alignItems: 'center',
          '&:hover': {
            color: 'text'
          }
        }}
        {...props}
      >
        <Icon name="dots_h" />
      </MenuButton>
      <MenuList sx={{ variant: 'cards.compact', borderRadius: 'round', mt: 3, p: 1 }}>
        <MenuItem
          onSelect={() => ({})}
          sx={{
            variant: 'menubuttons.default.headerItem'
          }}
        >
          {mkrInChief && <MenuItemContent icon="mkr_locked" label={formatValue(mkrInChief)} />}
        </MenuItem>
        <MenuItem
          onSelect={() => ({})}
          sx={{
            variant: 'menubuttons.default.headerItem'
          }}
        >
          <MenuItemContent
            icon="gas"
            label={
              <Text>
                <span sx={{ color: 'primary' }}>{gas}</span> Gwei
              </Text>
            }
          />
        </MenuItem>
        <MenuItem
          onSelect={() => ({})}
          sx={{
            variant: 'menubuttons.default.headerItem'
          }}
        >
          <ExternalLink
            styles={{ variant: 'links.nostyle' }}
            href="https://discord.gg/GHcFMdKden"
            title="Support"
          >
            <MenuItemContent icon="discord_outline" label="Support" />
          </ExternalLink>
        </MenuItem>
        <MenuItem
          onSelect={() => ({})}
          sx={{
            variant: 'menubuttons.default.headerItem'
          }}
        >
          <ExternalLink
            styles={{ variant: 'links.nostyle' }}
            href="https://governance-metrics-dashboard-gupjnd1ew-hernandoagf.vercel.app/"
            title="Stats"
          >
            <MenuItemContent icon="stats" label="Stats" />
          </ExternalLink>
        </MenuItem>
        <MenuItem
          onSelect={() => ({})}
          sx={{
            variant: 'menubuttons.default.headerItem'
          }}
        >
          <ExternalLink
            styles={{ variant: 'links.nostyle' }}
            href="https://makerdao.world/en/learn/governance/"
            title="FAQs"
          >
            <MenuItemContent icon="faq" label="FAQs" />
          </ExternalLink>
        </MenuItem>
        <MenuItem
          onSelect={onToggleTheme}
          sx={{
            variant: 'menubuttons.default.headerItem'
          }}
        >
          <MenuItemContent icon="color_mode_sun" label={`${mode === 'dark' ? 'Light' : 'Dark'} mode`} />
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
  const chiefAddress = useContractAddress('chief');
  const { data: mkrInChief } = useTokenBalance(Tokens.MKR, chiefAddress);

  const { data: gas } = useGasPrice();

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
          <HeaderMenu mkrInChief={mkrInChief} gas={gas} />
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
