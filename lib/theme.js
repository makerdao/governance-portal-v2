import { transparentize } from '@theme-ui/color';

import { alerts } from './theme/alerts';
import { badges } from './theme/badges';
import { buttons } from './theme/buttons';
import { colors } from './theme/colors';
import { cards } from './theme/cards';
import { forms } from './theme/forms';
import { icons } from './theme/icons';
import { markdown } from './theme/markdown';
import { styles } from './theme/styles';
import { text } from './theme/text';

export default {
  alerts,
  badges,
  buttons,
  colors,
  cards,
  forms,
  icons,
  markdown,
  styles,
  text,

  useBorderBox: true,
  useBodyStyles: true,
  breakpoints: ['40em', '52em', '64em', '88em'],

  fonts: {
    body: '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu',
    heading: '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu',
    monospace: 'monospace'
  },

  fontSizes: [10, 12, 14, 16, 18, 20, 24, 32, 48, 64, 96],

  fontWeights: {
    body: 400,
    heading: 700,
    bold: 700,
    semiBold: 500
  },

  lineHeights: {
    body: 1.5,
    heading: 1.125,
    tight: 1.05,
    loose: 1.2
  },

  borders: {
    light: '1px solid'
  },

  layout: {
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'background',
      zIndex: 1000,
      p: 4
    },
    container: {
      px: 2
    }
  },

  shadows: {
    floater: '0 0 8px rgba(0, 0, 0, 0.125)',
    lightPrimary: theme => `0 0 1px 5px ${transparentize('primary', 0.8)(theme)}`,
    faint: '0px 2px 7px #EAEFF440'
  },

  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],

  sizes: {
    ...[0, 4, 8, 16, 32, 64, 128, 256, 512],
    sidebar: 400,
    title: 630,
    column: 770,
    page: 1200,
    dashboard: 1380,
    container: 1140
  },

  radii: {
    xs: 2,
    small: 4,
    medium: 6,
    roundish: 12,
    round: 24
  },

  images: {
    avatar: {}
  },

  messages: {}, // Defaults to "primary" & "highlight"

  modal: {
    height: {
      mobile: '195px',
      desktop: '78px'
    }
  },

  links: {
    card: {
      variant: 'cards.tight',
      textDecoration: 'none',
      color: 'inherit'
    },
    nostyle: {
      textDecoration: 'none',
      color: 'inherit'
    },
    nav: {
      p: 2,
      fontSize: 3,
      fontWeight: 'body',
      letterSpacing: '0.4px',
      color: 'text',
      cursor: 'pointer',
      '&:hover': {
        color: 'primary',
        cursor: 'pointer'
      }
    }
  },

  listboxes: {
    // for @reach-ui/listbox
    default: {
      button: { variant: 'buttons.outline', width: '100%' },
      popover: {
        variant: 'cards.tight',
        padding: 2,
        cursor: 'pointer',
        '&:focus-within': { outline: 'none' }
      },
      list: { 'li[aria-selected="true"]': { backgroundColor: 'primary', width: '100%' } }
    }
  },

  menubuttons: {
    // for @reach-ui/menubutton
    default: {
      list: {
        variant: 'cards.tight'
      },
      item: {
        fontSize: 3,
        '&[data-selected]': { backgroundColor: 'primary' }
      }
    }
  },

  dialog: {
    mobile: {
      width: '100vw',
      maxHeight: '90vh',
      overflow: 'scroll',
      position: 'absolute',
      bottom: 0,
      mb: 0,
      borderTopLeftRadius: 'roundish',
      borderTopRightRadius: 'roundish',
      border: theme => `1px solid ${theme.colors.secondaryMuted}`,
      px: 3,
      py: 4,
      background: theme => theme.colors.surface
    },
    desktop: {
      border: theme => `1px solid ${theme.colors.secondaryMuted}`,
      borderRadius: '8px',
      boxShadow: '0px 10px 50px hsla(0, 0%, 0%, 0.33)',
      width: '50em',
      background: theme => theme.colors.surface
    }
  }
};
