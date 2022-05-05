import { useRouter } from 'next/router';
import {
  Flex,
  NavLink,
  Container,
  Close,
  Box,
  IconButton,
  Divider,
  Text,
  useColorMode,
  Badge
} from 'theme-ui';
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
import { useGasPrice } from 'modules/web3/hooks/useGasPrice';
import { ExternalLink } from '../ExternalLink';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { GASNOW_URL, SupportedNetworks } from 'modules/web3/constants/networks';

type HeaderProps = {
  activePollCount?: number;
  activeProposalsCount?: number;
};

const MenuItemContent = ({ label, icon }) => {
  return (
    <Flex sx={{ alignItems: 'center', gap: 2, justifyContent: 'flex-start' }}>
      <Icon name={icon} size={'auto'} sx={{ height: '20px', width: '20px' }} />
      {typeof label === 'function' ? { label } : <Text>{label}</Text>}
    </Flex>
  );
};

const HeaderMenu = ({ onToggleTheme, mode, ...props }): JSX.Element => {
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
          <InternalLink href="/account" title="View account">
            <MenuItemContent icon="person" label="Account" />
          </InternalLink>
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
            href="https://governance-metrics-dashboard.vercel.app/"
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

const Header = ({ activePollCount, activeProposalsCount }: HeaderProps): JSX.Element => {
  const router = useRouter();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const bpi = useBreakpointIndex();
  const { account } = useAccount();
  const { data: gas } = useGasPrice();
  const { network } = useActiveWeb3React();
  const [mode, setMode] = useColorMode();

  const onToggleTheme = () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    const html = document.getElementsByTagName('html');
    if (html) html[0].style.colorScheme = next;
    setMode(next);
  };

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
          <Flex>
            <NavLink
              href={'/polling'}
              title="View polling page"
              p={0}
              sx={{
                display: ['none', 'block'],
                ml: [0, 0, 4, 'auto'],
                color: router?.asPath?.startsWith('/polling') ? 'primary' : undefined
              }}
            >
              Polling
            </NavLink>
            {bpi > 1 && activePollCount && activePollCount > 0 && (
              <NavLink href={'/polling'} title="View polling page" p={0}>
                <Badge
                  variant="solidCircle"
                  sx={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    display: 'flex',
                    p: 2,
                    mt: '-1rem',
                    ml: -10
                  }}
                >
                  {activePollCount}
                </Badge>
              </NavLink>
            )}
          </Flex>
          <Flex>
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
            {bpi > 1 && activeProposalsCount && activeProposalsCount > 0 && (
              <NavLink href={'/executive'} title="View executive page" p={0}>
                <Badge
                  sx={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    display: 'flex',
                    mt: '-1rem',
                    ml: -10
                  }}
                  variant="solidCircle"
                >
                  {activeProposalsCount}
                </Badge>
              </NavLink>
            )}
          </Flex>

          <NavLink
            href={'/delegates'}
            title="View delegates page"
            p={0}
            sx={{
              display: ['none', 'flex'],
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
              flexShrink: 0,
              display: ['none', 'flex'],
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
        {bpi > 1 && account && network === SupportedNetworks.MAINNET && (
          <ExternalLink
            title="Ethereum Gas Price"
            href={GASNOW_URL}
            styles={{
              variant: 'links.nostyle'
            }}
          >
            <Flex
              sx={{
                alignItems: 'center',
                gap: 1,
                justifyContent: 'flex-start',
                cursor: 'pointer',
                px: [0, 0, 2, 3]
              }}
            >
              <Text variant="smallText">{gas}</Text>
              <Icon name="gas" size={3} />
            </Flex>
          </ExternalLink>
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
        {showMobileMenu && (
          <MobileMenu
            hide={() => setShowMobileMenu(false)}
            router={router}
            gas={gas}
            onToggleTheme={onToggleTheme}
            mode={mode}
            network={network}
          />
        )}
        {bpi > 0 && (
          <Flex sx={{ ml: 3 }}>
            <HeaderMenu onToggleTheme={onToggleTheme} mode={mode} />
          </Flex>
        )}
      </Flex>
    </Box>
  );
};

const MobileMenu = ({ hide, router, gas, onToggleTheme, mode, network }) => {
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
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        <InternalLink href={'/'} title="View homepage">
          <IconButton aria-label="Maker home" sx={{ width: '40px', height: 4, p: 0 }}>
            <Icon name="maker" size="40px" color="ornament" sx={{ cursor: 'pointer' }} />
          </IconButton>
        </InternalLink>
        <Flex sx={{ alignItems: 'center', gap: 2 }}>
          <NetworkSelect />
          <Close sx={{ display: ['block'], '> svg': { size: [4] } }} onClick={hide} />
        </Flex>
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
        <Flex
          sx={{
            justifyContent: 'space-between',
            px: 3,
            py: 4,
            width: '100%',
            fontSize: 3
          }}
        >
          <Flex sx={{ flexDirection: 'column', alignItems: 'flex-start', gap: 3, width: '50%' }}>
            <InternalLink title="View polling page" href="/polling">
              <Text sx={{ fontWeight: 'semiBold' }}>Polling</Text>
            </InternalLink>
            <InternalLink title="View executive page" href="/executive">
              <Text sx={{ fontWeight: 'semiBold' }}>Executive</Text>
            </InternalLink>
          </Flex>
          <Flex sx={{ flexDirection: 'column', alignItems: 'flex-start', gap: 3, width: '50%' }}>
            <InternalLink title="View delegate page" href="/delegates">
              <Text sx={{ fontWeight: 'semiBold' }}>Delegates</Text>
            </InternalLink>
            <InternalLink title="View emergency shutdown page" href="/esmodule">
              <Text sx={{ fontWeight: 'semiBold' }}>ES Module</Text>
            </InternalLink>
          </Flex>
        </Flex>
        <Divider sx={{ width: '100%' }} />
        <Flex
          sx={{
            justifyContent: 'space-between',
            px: 3,
            py: 4,
            width: '100%',
            fontSize: 3
          }}
        >
          <Flex sx={{ flexDirection: 'column', alignItems: 'flex-start', gap: 3, width: '50%' }}>
            <InternalLink href="/account" title="View account">
              <MenuItemContent icon="person" label="Account" />
            </InternalLink>
            {network === SupportedNetworks.MAINNET && (
              <ExternalLink
                title="Ethereum Gas Price"
                href={GASNOW_URL}
                styles={{
                  variant: 'links.nostyle'
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
              </ExternalLink>
            )}
            <Flex onClick={hide}>
              <ExternalLink
                styles={{ variant: 'links.nostyle' }}
                href="https://discord.gg/GHcFMdKden"
                title="Support"
              >
                <MenuItemContent icon="discord_outline" label="Support" />
              </ExternalLink>
            </Flex>
          </Flex>

          <Flex sx={{ flexDirection: 'column', alignItems: 'flex-start', gap: 3, width: '50%' }}>
            <Flex onClick={hide}>
              <ExternalLink
                styles={{ variant: 'links.nostyle' }}
                href="https://governance-metrics-dashboard.vercel.app/"
                title="Stats"
              >
                <MenuItemContent icon="stats" label="Stats" />
              </ExternalLink>
            </Flex>
            <Flex onClick={hide}>
              <ExternalLink
                styles={{ variant: 'links.nostyle' }}
                href="https://makerdao.world/en/learn/governance/"
                title="FAQs"
              >
                <MenuItemContent icon="faq" label="FAQs" />
              </ExternalLink>
            </Flex>
            <Flex onClick={onToggleTheme}>
              <MenuItemContent icon="color_mode_sun" label={`${mode === 'dark' ? 'Light' : 'Dark'} mode`} />
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Container>
  );
};

export default Header;
