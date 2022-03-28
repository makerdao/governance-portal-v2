import theme from '@makerdao/dai-ui-theme-maker-neue';
import { icons } from '@makerdao/dai-ui-icons';
import { icons as brandIcons } from '@makerdao/dai-ui-icons-branding';

export default {
  ...theme,
  shadows: {
    ...theme.shadows,
    faint: '0px 2px 7px #EAEFF440'
  },
  breakpoints: ['40em', '52em', '64em', '88em'],
  colors: {
    ...theme.colors,
    text: '#231536',
    textSecondary: '#666666',
    textMuted: '#A5A6A8',
    primaryMuted: '#A3DDD7',
    primaryAlt: '#098C7D',
    background: '#F7F8F9',
    footerText: '#333333',
    greenLinkHover: '#087C6D',
    blueLinkHover: '#1147C8',
    formGrey: '#C2C2C2',
    badgeGrey: '#9FAFB9',
    mutedOrange: '#F9A606',
    onSurface: '#708390',
    outline: '#D5D9E0',
    ornament: '#000',
    skeletonColor: '#EEE',
    skeletonHighlightColor: '#F5F5F5',
    tagColorOne: '#D44C96',
    tagColorOneBg: '#FFF4FA',
    tagColorTwo: '#8F2EC1',
    tagColorTwoBg: '#FBF2FF',
    tagColorThree: '#02CB9B',
    tagColorThreeBg: '#EBFFFA',
    tagColorFour: '#FF4085',
    tagColorFourBg: '#FFF0F4',
    tagColorFive: '#EF5277',
    tagColorFiveBg: '#FEEEF2',
    tagColorSix: '#5D48FF',
    tagColorSixBg: '#F7F5FF',
    tagColorSeven: '#7D8FAA',
    tagColorSevenBg: '#F2F5FA',
    tagColorEight: '#00B5D3',
    tagColorEightBg: '#EEFAFC',
    tagColorNine: '#34AAFF',
    tagColorNineBg: '#F1F9FF',
    tagColorTen: '#FF8237',
    tagColorTenBg: '#FFF5EF',
    tagColorEleven: '#1AAB9B',
    tagColorElevenBg: '#EEFFFD',
    tagColorTwelve: '#635696',
    tagColorTwelveBg: '#F7F4FF',
    tagColorThirteen: '#E7C200',
    tagColorThirteenBg: '#FFFBEF',
    tagColorFourteen: '#FF36C7',
    tagColorFourteenBg: '#FFF3F8',
    tagColorFifteen: '#FF8237',
    tagColorFifteenBg: '#FFFBEF',
    tagColorSixteen: '#FF8237',
    tagColorSixteenBg: '#FFFBEF',
    tagColorSeventeen: '#AD927D',
    tagColorSeventeenBg: '#FFF9F4',
    voterYellow: '#FDC134',
    bull: '#1AAB9B',
    bear: '#F77249',
    modes: {
      dark: {
        primary: '#1DC1AE',
        onPrimary: '#000',
        background: '#141414',
        onBackgroundAlt: '#D7C9EA',
        onBackground: '#7E7E88',
        text: '#D7C9EA',
        textMuted: '#7E7E88',
        textSecondary: '#7E7E88',
        secondaryMuted: '#D7C9EA',
        surface: '#000',
        onSurface: '#7E7E88',
        outline: '#282F3A',
        primaryMuted: '#13554D',
        muted: '#282F3A',
        ornament: '#1DC1AE',
        secondaryAlt: '#D7C9EA',
        accentBlue: '#5D8DFC',
        noticeAlt: '#3a3528',
        onNotice: '#FCC045',
        warningAlt: '380000',
        onWarning: '#EF0505',
        successAlt: '#002C26',
        onSuccess: '#1DC1AE',
        skeletonColor: '#000',
        skeletonHighlightColor: '#141414',
        tagColorOne: '#D44C96',
        tagColorOneBg: '#121212',
        tagColorTwo: '#8F2EC1',
        tagColorTwoBg: '#121212',
        tagColorThree: '#02CB9B',
        tagColorThreeBg: '#121212',
        tagColorFour: '#FF4085',
        tagColorFourBg: '#121212',
        tagColorFive: '#EF5277',
        tagColorFiveBg: '#121212',
        tagColorSix: '#5D48FF',
        tagColorSixBg: '#121212',
        tagColorSeven: '#7D8FAA',
        tagColorSevenBg: '#121212',
        tagColorEight: '#00B5D3',
        tagColorEightBg: '#121212',
        tagColorNine: '#34AAFF',
        tagColorNineBg: '#121212',
        tagColorTen: '#FF8237',
        tagColorTenBg: '#121212',
        tagColorEleven: '#1AAB9B',
        tagColorElevenBg: '#121212',
        tagColorTwelve: '#635696',
        tagColorTwelveBg: '#121212',
        tagColorThirteen: '#E7C200',
        tagColorThirteenBg: '#121212',
        tagColorFourteen: '#FF36C7',
        tagColorFourteenBg: '#121212',
        tagColorFifteen: '#FF8237',
        tagColorFifteenBg: '#121212',
        tagColorSixteen: '#FF8237',
        tagColorSixteenBg: '#121212',
        tagColorSeventeen: '#AD927D',
        tagColorSeventeenBg: '#121212',
        bull: '#1AAB9B',
        bear: '#F77249'
      }
    }
  },
  sizes: {
    ...theme.sizes,
    sidebar: 400,
    title: 630,
    column: 770,
    page: 1200,
    dashboard: 1380
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
    }
  },
  styles: {
    ...theme.styles,
    hr: {
      color: 'muted'
    }
  },
  cards: {
    primary: {
      border: '1px solid',
      borderColor: 'muted',
      p: [3, 4],
      borderRadius: 'medium',
      bg: 'surface'
      // boxShadow: 'faint'
    },
    compact: {
      variant: 'cards.primary',
      p: 3
    },
    noPadding: {
      variant: 'cards.primary',
      p: 0
    },
    tight: {
      variant: 'cards.primary',
      p: [2, 2]
    },
    emphasized: {
      variant: 'cards.primary',
      border: '1px solid',
      borderColor: 'onSecondary'
    }
  },
  modal: {
    height: {
      mobile: '195px',
      desktop: '78px'
    }
  },
  badges: {
    ...theme.badges,
    primary: {
      ...theme.badges.primary,
      variant: 'text.caps',
      fontSize: 1,
      px: '16px',
      overflow: 'hidden',
      borderRadius: 'round',
      border: '1px solid'
    },
    circle: {
      width: '25px',
      height: '25px',
      p: 1,
      borderRadius: 'round',
      variant: 'text.caps',
      color: 'primary',
      bg: 'surface',
      border: '1px solid',
      borderColor: 'primary'
    }
  },
  links: {
    ...theme.links,
    card: {
      variant: 'cards.tight',
      textDecoration: 'none',
      color: 'inherit'
    },
    nostyle: {
      textDecoration: 'none',
      color: 'inherit'
    }
  },
  buttons: {
    ...theme.buttons,
    card: {
      variant: 'cards.tight',
      color: 'inherit',
      cursor: 'pointer'
    },
    primaryLarge: {
      variant: 'buttons.primary',
      py: '12px'
    },
    primaryOutline: {
      variant: 'buttons.outline',
      color: 'primary',
      borderColor: 'primary',
      py: '12px',

      '&:hover:enabled': {
        color: 'primary',
        borderColor: 'primary',
        bg: 'primaryMuted'
      },
      '&:active': {
        color: 'primary',
        borderColor: 'primary',
        bg: 'primaryMuted'
      },
      '&:disabled': {
        color: 'primary',
        borderColor: 'primary',
        opacity: 0.5,
        cursor: 'not-allowed'
      }
    },
    outline: { ...theme.buttons.outline, borderColor: 'outline' },
    mutedOutline: {
      variant: 'buttons.outline',
      color: 'textSecondary',
      borderColor: 'secondaryMuted',
      borderRadius: 'small',
      textTransform: 'uppercase',
      fontSize: 1,
      px: [2, 3],
      '&:hover': {
        color: 'text',
        borderColor: 'onSecondary'
      }
    },
    close: {
      cursor: 'pointer',
      p: 0,
      size: '4',
      ':focus': {
        outline: 'none'
      }
    },
    icon: {
      cursor: 'pointer'
    }
  },
  text: {
    ...theme.text,
    heading: {
      ...theme.text.heading,
      fontWeight: 500,
      color: 'text'
    },
    caps: {
      ...theme.text.caps,
      fontSize: 1,
      fontWeight: 600,
      color: 'textSecondary',
      letterSpacing: '0.05em'
    },
    smallCaps: {
      ...theme.text.caps,
      fontSize: 1,
      fontWeight: 'body',
      color: 'textSecondary',
      letterSpacing: '0.05em'
    },
    secondary: {
      color: 'textSecondary',
      fontSize: '15px',
      fontWeight: 400
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
  },
  markdown: {
    default: {
      wordBreak: 'break-word',
      h1: {
        color: 'text',
        fontSize: [5, 6],
        fontWeight: 500
      },
      h2: {
        color: 'text',
        fontSize: [4, 5],
        fontWeight: 500,
        mb: 0
      },
      h3: {
        color: 'text',
        fontSize: [3, 4],
        fontWeight: 500
      },
      p: {
        color: 'textSecondary',
        fontSize: [2, 3],
        my: 2
      },
      li: {
        fontSize: [2, 3],
        color: 'textSecondary'
      },
      a: {
        color: 'accentBlue',
        textDecoration: 'none',
        ':hover': { color: 'blueLinkHover' }
      },
      '& > :first-of-type': {
        mt: 0
      },
      table: {
        borderSpacing: 0,
        borderCollapse: 'collapse',
        display: 'block',
        width: '100%',
        overflow: 'auto'
      },
      th: {
        fontWeight: 600,
        padding: '6px 13px',
        border: theme => `1px solid ${theme.colors.muted}`
      },
      td: {
        padding: '6px 13px',
        border: theme => `1px solid ${theme.colors.muted}`
      },

      tr: {
        backgroundColor: 'surface',
        borderTop: theme => `1px solid ${theme.colors.muted}`,
        ':nth-of-type(2n)': {
          backgroundColor: 'background'
        }
      }
    }
  },
  icons: {
    chevron_right: icons.chevron_right,
    chevron_left: icons.chevron_left,
    chevron_down: icons.chevron_down,
    chevron_up: icons.chevron_up,
    checkmark: icons.checkmark,
    edit: icons.edit,
    verified: icons.verified,
    warning: icons.warning,
    Trezor: brandIcons.trezor,
    Ledger: brandIcons.ledger,
    Mainnet: brandIcons.ether_circle_color,
    Goerli: brandIcons.ether_circle_color,
    GoerliFork: brandIcons.ether_circle_color,
    play: {
      path: (
        <g>
          <path d="M15.5192 9.13619C16.1807 9.52207 16.1807 10.4779 15.5192 10.8638L6.50387 16.1227C5.83721 16.5116 5 16.0307 5 15.2589L5 4.74101C5 3.96922 5.83722 3.48835 6.50387 3.87723L15.5192 9.13619Z" />
        </g>
      ),
      viewBox: '0 0 20 20'
    },
    maker: {
      path: (
        <g>
          <path
            d="M3.55857 17.2617V9.21227L9.66296 13.8061V17.2617H11.2215V13.482C11.2215 13.1964 11.0873 12.9274 10.859 12.7556L3.45585 7.18437C2.85668 6.73348 2 7.16094 2 7.91082V17.2617H3.55857Z"
            fill="currentColor"
          />
          <path
            d="M20.4414 17.2617V9.21227L14.337 13.8061V17.2617H12.7785V13.482C12.7785 13.1964 12.9127 12.9274 13.141 12.7556L20.5442 7.18437C21.1433 6.73348 22 7.16094 22 7.91082V17.2617H20.4414Z"
            fill="currentColor"
          />
        </g>
      ),
      viewBox: '0 0 24 24'
    },
    govIntro: {
      path: (
        <g>
          <path
            opacity="0.7"
            d="M7.95117 18.9673H36.8673V32.1207C36.8673 32.7597 36.6601 33.3826 36.1595 33.7798C34.7417 34.9047 30.9286 37.0398 22.4092 37.0398C13.8898 37.0398 10.0767 34.9047 8.65894 33.7798C8.15835 33.3826 7.95117 32.7597 7.95117 32.1207V18.9673Z"
            fill="url(#paint0_linear)"
          />
          <path
            d="M21.9239 10.0664C22.2414 9.97786 22.5771 9.97786 22.8947 10.0664L44.4881 16.0876C44.9168 16.2071 44.9326 16.8091 44.5109 16.951L22.9857 24.1951C22.6117 24.321 22.2068 24.321 21.8328 24.1951L0.30771 16.951C-0.114076 16.8091 -0.0982106 16.2071 0.330466 16.0876L21.9239 10.0664Z"
            fill="url(#paint1_linear)"
          />
          <rect x="43" y="19" width="1" height="13" rx="0.5" fill="url(#paint2_linear)" />
          <circle cx="43.5" cy="35.5" r="1.5" fill="url(#paint3_linear)" />
          <defs>
            <linearGradient
              id="paint0_linear"
              x1="21.1183"
              y1="18.9673"
              x2="19.0828"
              y2="34.7904"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#F9D799" />
              <stop offset="1" stopColor="#FFA048" />
            </linearGradient>
            <linearGradient
              id="paint1_linear"
              x1="22.0425"
              y1="4.801"
              x2="25.8969"
              y2="23.8438"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#F9D799" />
              <stop offset="1" stopColor="#FFA048" />
            </linearGradient>
            <linearGradient
              id="paint2_linear"
              x1="43.212"
              y1="21.3542"
              x2="45.9703"
              y2="21.8919"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FFB733" />
              <stop offset="1" stopColor="#FFA048" />
            </linearGradient>
            <linearGradient
              id="paint3_linear"
              x1="42.6359"
              y1="34.5433"
              x2="44.4204"
              y2="35.727"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#F9D799" />
              <stop offset="1" stopColor="#FFA048" />
            </linearGradient>
          </defs>
        </g>
      ),
      viewBox: '0 0 45 45'
    },
    govForum: {
      path: (
        <g>
          <path
            opacity="0.5"
            d="M45 20C45 16.6863 42.3137 14 39 14H20C17.7909 14 16 15.7909 16 18V29.6C16 32.9137 18.6863 35.6 22 35.6H40.4688L45 41V20Z"
            fill="url(#paint4_linear)"
          />
          <path
            d="M0 11C0 7.68629 2.68629 5 6 5H25C27.2091 5 29 6.79086 29 9V20.6C29 23.9137 26.3137 26.6 23 26.6H4.53125L0 32V11Z"
            fill="url(#paint5_linear)"
          />
          <defs>
            <linearGradient
              id="paint4_linear"
              x1="40.0156"
              y1="14.45"
              x2="20.2222"
              y2="35.2868"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#ACDCFF" />
              <stop offset="0.9375" stopColor="#B19DFF" />
            </linearGradient>
            <linearGradient
              id="paint5_linear"
              x1="0.906249"
              y1="7.7"
              x2="28.8695"
              y2="27.6827"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#ACDCFF" />
              <stop offset="0.9375" stopColor="#B19DFF" />
            </linearGradient>
          </defs>
        </g>
      ),
      viewBox: '0 0 45 45'
    },

    govCalls: {
      path: (
        <g>
          <circle opacity="0.2" cx="23.5019" cy="24.9999" r="15.9999" fill="url(#paint6_linear)" />
          <circle cx="24" cy="6.99998" r="3.99998" fill="url(#paint7_linear)" />
          <circle cx="5.49998" cy="31" r="4.99998" fill="url(#paint8_linear)" />
          <circle cx="38.5" cy="37" r="5.99998" fill="url(#paint9_linear)" />
          <defs>
            <linearGradient
              id="paint6_linear"
              x1="9.80497"
              y1="17.3636"
              x2="34.236"
              y2="36.2404"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#BBF2E3" />
              <stop offset="1" stopColor="#00E777" />
            </linearGradient>
            <linearGradient
              id="paint7_linear"
              x1="20.5758"
              y1="5.0909"
              x2="26.6835"
              y2="9.8101"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#90F6E3" />
              <stop offset="1" stopColor="#6FCBB5" />
            </linearGradient>
            <linearGradient
              id="paint8_linear"
              x1="1.21969"
              y1="28.6136"
              x2="8.85439"
              y2="34.5126"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#BBF2E3" />
              <stop offset="1" stopColor="#83D9C9" />
            </linearGradient>
            <linearGradient
              id="paint9_linear"
              x1="33.3636"
              y1="34.1364"
              x2="42.5253"
              y2="41.2151"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#CBFFD0" />
              <stop offset="1" stopColor="#00D9E7" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </g>
      ),
      viewBox: '0 0 45 45'
    },
    clock: {
      path: (
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13.3846 8C13.3846 10.9738 10.9738 13.3846 8 13.3846C5.02616 13.3846 2.61538 10.9738 2.61538 8C2.61538 5.02616 5.02616 2.61538 8 2.61538C10.9738 2.61538 13.3846 5.02616 13.3846 8ZM15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8ZM7.5 9C7.22386 9 7 8.77614 7 8.5V4.5C7 4.22386 7.22386 4 7.5 4C7.77614 4 8 4.22386 8 4.5V8H11.5C11.7761 8 12 8.22386 12 8.5C12 8.77614 11.7761 9 11.5 9H7.5Z"
          fill="currentColor"
        />
      ),
      viewBox: '0 0 16 16'
    },
    twitter: {
      path: (
        <path
          fill="currentColor"
          d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"
        />
      ),
      viewBox: '0 0 24 24'
    },
    reddit: {
      path: (
        <path
          fill="currentColor"
          d="M14.238 15.348c.085.084.085.221 0 .306-.465.462-1.194.687-2.231.687l-.008-.002-.008.002c-1.036 0-1.766-.225-2.231-.688-.085-.084-.085-.221 0-.305.084-.084.222-.084.307 0 .379.377 1.008.561 1.924.561l.008.002.008-.002c.915 0 1.544-.184 1.924-.561.085-.084.223-.084.307 0zm-3.44-2.418c0-.507-.414-.919-.922-.919-.509 0-.923.412-.923.919 0 .506.414.918.923.918.508.001.922-.411.922-.918zm13.202-.93c0 6.627-5.373 12-12 12s-12-5.373-12-12 5.373-12 12-12 12 5.373 12 12zm-5-.129c0-.851-.695-1.543-1.55-1.543-.417 0-.795.167-1.074.435-1.056-.695-2.485-1.137-4.066-1.194l.865-2.724 2.343.549-.003.034c0 .696.569 1.262 1.268 1.262.699 0 1.267-.566 1.267-1.262s-.568-1.262-1.267-1.262c-.537 0-.994.335-1.179.804l-2.525-.592c-.11-.027-.223.037-.257.145l-.965 3.038c-1.656.02-3.155.466-4.258 1.181-.277-.255-.644-.415-1.05-.415-.854.001-1.549.693-1.549 1.544 0 .566.311 1.056.768 1.325-.03.164-.05.331-.05.5 0 2.281 2.805 4.137 6.253 4.137s6.253-1.856 6.253-4.137c0-.16-.017-.317-.044-.472.486-.261.82-.766.82-1.353zm-4.872.141c-.509 0-.922.412-.922.919 0 .506.414.918.922.918s.922-.412.922-.918c0-.507-.413-.919-.922-.919z"
        />
      ),
      viewBox: '0 0 24 24'
    },
    telegram: {
      path: (
        <path
          fill="currentColor"
          d="M19.4943 1.54763L16.5441 15.9738C16.3215 16.992 15.7411 17.2454 14.9162 16.7657L10.4211 13.3311L8.25204 15.4941C8.01201 15.743 7.81126 15.9512 7.34865 15.9512L7.6716 11.2043L16.0029 3.39841C16.3651 3.06355 15.9244 2.87802 15.4399 3.21288L5.14035 9.93726L0.706292 8.49826C-0.258202 8.18602 -0.275659 7.4982 0.907047 7.01853L18.2505 0.0905301C19.0535 -0.221705 19.7561 0.276061 19.4943 1.54763Z"
        />
      ),
      viewBox: '0 0 20 17'
    },
    rocket_chat: {
      path: (
        <path
          fill="currentColor"
          d="M496.293,255.338c0-24.103-7.21-47.215-21.437-68.699c-12.771-19.288-30.666-36.362-53.184-50.745
          c-43.474-27.771-100.612-43.065-160.885-43.065c-20.131,0-39.974,1.702-59.222,5.072c-11.942-11.176-25.919-21.233-40.712-29.187
          c-79.026-38.298-144.561-0.9-144.561-0.9s60.931,50.053,51.023,93.93c-27.259,27.041-42.033,59.646-42.033,93.594
          c0,0.108,0.005,0.216,0.006,0.324c-0.001,0.108-0.006,0.216-0.006,0.324c0,33.949,14.774,66.554,42.033,93.595
          c9.907,43.874-51.023,93.93-51.023,93.93s65.535,37.397,144.561-0.901c14.792-7.953,28.77-18.01,40.712-29.188
          c19.249,3.372,39.091,5.072,59.222,5.072c60.272,0,117.411-15.294,160.885-43.064c22.518-14.383,40.412-31.457,53.184-50.742
          c14.227-21.487,21.437-44.599,21.437-68.702c0-0.107-0.006-0.216-0.006-0.324C496.287,255.554,496.293,255.446,496.293,255.338z
            M260.882,387.763c-25.367,0-49.66-2.932-72.107-8.282c-22.81,27.443-72.993,65.596-121.742,53.26
          c15.857-17.031,39.352-45.81,34.32-93.207c-29.218-22.738-46.759-51.832-46.759-83.541c0-72.776,92.36-131.769,206.288-131.769
          c113.928,0,206.288,58.993,206.288,131.769C467.17,328.765,374.81,387.763,260.882,387.763z M288.283,255.991
          c0,15.133-12.27,27.403-27.4,27.403c-15.134,0-27.402-12.271-27.402-27.403s12.268-27.401,27.402-27.401
          C276.014,228.59,288.283,240.858,288.283,255.991z M356.163,228.59c-15.133,0-27.4,12.268-27.4,27.401s12.268,27.403,27.4,27.403
          c15.134,0,27.399-12.271,27.399-27.403S371.297,228.59,356.163,228.59z M165.601,228.59c-15.133,0-27.4,12.268-27.4,27.401
          s12.268,27.403,27.4,27.403c15.134,0,27.401-12.271,27.401-27.403S180.735,228.59,165.601,228.59z"
        />
      ),
      viewBox: '0 0 512 512'
    },
    medium: {
      path: (
        <g>
          <rect width="19.2343" height="15.27" fill="black" fillOpacity="0" />
          <rect width="19.2343" height="15.27" fill="black" fillOpacity="0" />
          <rect width="19.2343" height="15.27" fill="black" fillOpacity="0" />
          <path d="M2.28082 3.11504C2.30472 2.87893 2.21468 2.64556 2.03837 2.48665L0.242449 0.323175V0H5.81879L10.129 9.45286L13.9184 0H19.2343V0.323175L17.6988 1.79541C17.5664 1.89632 17.5008 2.06217 17.5282 2.22631V13.0437C17.5008 13.2078 17.5664 13.3737 17.6988 13.4746L19.1984 14.9468V15.27H11.6555V14.9468L13.209 13.4387C13.3617 13.2861 13.3617 13.2412 13.3617 13.0078V4.26411L9.04247 15.2341H8.45879L3.43021 4.26411V11.6163C3.38828 11.9254 3.49094 12.2366 3.70858 12.4602L5.72899 14.9109V15.2341H0V14.9109L2.02041 12.4602C2.23646 12.2363 2.33314 11.923 2.28082 11.6163V3.11504Z" />
        </g>
      ),
      viewBox: '0 0 24 24'
    },
    menu: {
      path: (
        <g>
          <path
            d="M0 1C0 0.447715 0.447715 0 1 0H17C17.5523 0 18 0.447715 18 1C18 1.55228 17.5523 2 17 2H1C0.447716 2 0 1.55228 0 1Z"
            fill="currentColor"
          />
          <path
            d="M0 7C0 6.44772 0.447715 6 1 6H13C13.5523 6 14 6.44772 14 7C14 7.55228 13.5523 8 13 8H1C0.447716 8 0 7.55228 0 7Z"
            fill="currentColor"
          />
          <path
            d="M0 13C0 12.4477 0.447715 12 1 12H17C17.5523 12 18 12.4477 18 13C18 13.5523 17.5523 14 17 14H1C0.447716 14 0 13.5523 0 13Z"
            fill="currentColor"
          />
        </g>
      ),
      viewBox: '0 0 18 14'
    },
    we_chat: {
      path: (
        <path d="M21.502 19.525c1.524-1.105 2.498-2.738 2.498-4.554 0-3.326-3.237-6.023-7.229-6.023s-7.229 2.697-7.229 6.023c0 3.327 3.237 6.024 7.229 6.024.825 0 1.621-.117 2.36-.33l.212-.032c.139 0 .265.043.384.111l1.583.914.139.045c.133 0 .241-.108.241-.241l-.039-.176-.326-1.215-.025-.154c0-.162.08-.305.202-.392zm-12.827-17.228c-4.791 0-8.675 3.236-8.675 7.229 0 2.178 1.168 4.139 2.997 5.464.147.104.243.276.243.471l-.03.184-.391 1.458-.047.211c0 .16.13.29.289.29l.168-.054 1.899-1.097c.142-.082.293-.133.46-.133l.255.038c.886.255 1.842.397 2.832.397l.476-.012c-.188-.564-.291-1.158-.291-1.771 0-3.641 3.542-6.593 7.911-6.593l.471.012c-.653-3.453-4.24-6.094-8.567-6.094zm5.686 11.711c-.532 0-.963-.432-.963-.964 0-.533.431-.964.963-.964.533 0 .964.431.964.964 0 .532-.431.964-.964.964zm4.82 0c-.533 0-.964-.432-.964-.964 0-.533.431-.964.964-.964.532 0 .963.431.963.964 0 .532-.431.964-.963.964zm-13.398-5.639c-.639 0-1.156-.518-1.156-1.156 0-.639.517-1.157 1.156-1.157.639 0 1.157.518 1.157 1.157 0 .638-.518 1.156-1.157 1.156zm5.783 0c-.639 0-1.156-.518-1.156-1.156 0-.639.517-1.157 1.156-1.157.639 0 1.157.518 1.157 1.157 0 .638-.518 1.156-1.157 1.156z" />
      ),
      viewBox: '0 0 24 24'
    },
    youtube: {
      path: (
        <g>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M16.2511 4.3307C16.9395 4.51267 17.4816 5.04882 17.6656 5.7297C18 6.96373 18 9.53846 18 9.53846C18 9.53846 18 12.1132 17.6656 13.3473C17.4816 14.0281 16.9395 14.5643 16.2511 14.7463C15.0034 15.0769 10 15.0769 10 15.0769C10 15.0769 4.99666 15.0769 3.7489 14.7463C3.06051 14.5643 2.51832 14.0281 2.33434 13.3473C2 12.1132 2 9.53846 2 9.53846C2 9.53846 2 6.96373 2.33434 5.7297C2.51832 5.04882 3.06051 4.51267 3.7489 4.3307C4.99666 4 10 4 10 4C10 4 15.0034 4 16.2511 4.3307ZM12.5455 9.5386L8.36367 11.8761V7.20083L12.5455 9.5386Z"
            fill="currentColor"
          />
        </g>
      ),
      viewBox: '0 0 20 20'
    },
    subscribe_arrow: {
      path: (
        <g>
          <path d="M14 6.5L1 6.5" stroke="#989898" strokeLinecap="round" />
          <path
            d="M9 12L13.7929 7.20711C14.1834 6.81658 14.1834 6.18342 13.7929 5.79289L9 1"
            stroke="#989898"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ),
      viewBox: '0 0 15 13'
    },
    ballot: {
      path: (
        <path
          d="M12.4968 7.79952H8.62397C8.5349 7.79952 8.49027 7.69185 8.55322 7.62884L11.8663 4.31275C11.9053 4.27371 11.9053 4.21043 11.8663 4.17139L7.76879 0.0707638C7.72974 0.0316862 7.66641 0.0316745 7.62734 0.0707374L1.43768 6.2604C1.39863 6.29945 1.39863 6.36277 1.43768 6.40182L2.66467 7.62881C2.72766 7.6918 2.68305 7.79952 2.59396 7.79952H0.6C0.544771 7.79952 0.5 7.84429 0.5 7.89952V8.8992C0.5 8.95443 0.544772 8.9992 0.6 8.9992H1.00144C1.05667 8.9992 1.10144 9.04397 1.10144 9.0992V11.9C1.10144 11.9552 1.14621 12 1.20144 12H11.7986C11.8538 12 11.8986 11.9552 11.8986 11.9V9.0992C11.8986 9.04397 11.9433 8.9992 11.9986 8.9992H12.4C12.4552 8.9992 12.5 8.95443 12.5 8.8992V7.80272C12.5 7.80095 12.4986 7.79952 12.4968 7.79952ZM3.13323 6.40182C3.09417 6.36277 3.09417 6.29945 3.13323 6.2604L7.62417 1.76946C7.66322 1.73041 7.72654 1.73041 7.76559 1.76946L10.1707 4.17453C10.2097 4.21359 10.2097 4.27693 10.1706 4.31598L6.71323 7.77026C6.69448 7.789 6.66906 7.79952 6.64256 7.79952H4.57235C4.54582 7.79952 4.52039 7.78898 4.50164 7.77023L3.13323 6.40182Z"
          fill="currentColor"
        />
      ),
      viewBox: '0 0 13 13'
    },
    question: {
      path: (
        <g>
          <path
            d="M12.8825 8.28568C12.8825 8.64368 12.8343 8.95582 12.6691 9.24956C12.5131 9.53413 12.2147 9.83246 11.7741 10.1446L11.3473 10.4613C11.0903 10.6448 10.8975 10.8284 10.769 11.012C10.7378 11.06 10.7118 11.1158 10.6902 11.176C10.5868 11.4644 10.355 11.7142 10.0487 11.7142H9.6478C9.32128 11.7142 9.06034 11.4371 9.16316 11.1272C9.22608 10.9376 9.31032 10.7582 9.40582 10.6127C9.59859 10.3098 9.87856 10.0298 10.2457 9.77279C10.6405 9.49741 10.9204 9.25415 11.0857 9.04303C11.2509 8.8319 11.3335 8.59782 11.3335 8.3408C11.3335 8.01034 11.2279 7.75331 11.0168 7.56973C10.8057 7.37696 10.5028 7.28057 10.1081 7.28057C9.73169 7.28057 9.415 7.39073 9.15798 7.61103C8.95695 7.78334 8.82331 7.99777 8.75705 8.25431L7.23608 7.87407C7.3911 7.37242 7.66455 6.96346 8.05645 6.64719C8.57967 6.22494 9.19922 6 10.0254 6C10.9066 6 11.6548 6.21576 12.1597 6.61965C12.6645 7.01437 12.8825 7.57886 12.8825 8.28568Z"
            fill="#708390"
          />
          <path
            d="M9.61925 13.9999C9.30366 13.9999 9.04783 13.7441 9.04783 13.4285V13.0705C9.04783 12.7549 9.30366 12.4991 9.61925 12.4991H10.0874C10.403 12.4991 10.6588 12.7549 10.6588 13.0705V13.4285C10.6588 13.7441 10.403 13.9999 10.0874 13.9999H9.61925Z"
            fill="#708390"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2ZM4 10C4 6.68629 6.68629 4 10 4C13.3137 4 16 6.68629 16 10C16 13.3137 13.3137 16 10 16C6.68629 16 4 13.3137 4 10Z"
            fill="#708390"
          />
        </g>
      ),
      viewBox: '0 0 20 18'
    },
    pencil: {
      path: (
        <g>
          <path
            d="M12.2809 36.7049L5.2872 29.7112C5.06292 29.4895 4.78195 29.3338 4.47506 29.2611C4.16817 29.1884 3.8472 29.2016 3.5473 29.2992C3.24741 29.3968 2.98015 29.575 2.77482 29.8144C2.56949 30.0538 2.43399 30.3451 2.38317 30.6563L1.00849 39.0075C0.968341 39.2551 0.982869 39.5085 1.05105 39.7498C1.11924 39.9911 1.23943 40.2146 1.40318 40.4046C1.56694 40.5946 1.77029 40.7464 1.99896 40.8494C2.22763 40.9524 2.47607 41.0041 2.72685 41.0008H3.00178L11.353 39.6261C11.6679 39.578 11.9633 39.4432 12.206 39.2368C12.4488 39.0305 12.6294 38.7607 12.7277 38.4577C12.8235 38.1529 12.8325 37.8274 12.7536 37.5178C12.6746 37.2081 12.511 36.9267 12.2809 36.7049ZM3.84378 38.1484L4.59985 33.5604L8.43179 37.3923L3.84378 38.1484Z"
            fill="#D4D9E1"
          />
          <path
            d="M41.5188 7.50007L34.5348 0.498884C34.3741 0.339455 34.1834 0.213321 33.9739 0.127716C33.7643 0.0421118 33.5399 -0.00128013 33.3135 2.87518e-05C32.8622 0.00192891 32.4297 0.181089 32.1093 0.498884L2.86607 29.7421C2.70664 29.9029 2.58051 30.0935 2.4949 30.3031C2.4093 30.5127 2.36591 30.7371 2.36722 30.9635C2.36912 31.4148 2.54828 31.8472 2.86607 32.1676L9.86725 39.1688C10.1896 39.4892 10.6255 39.669 11.08 39.669C11.5344 39.669 11.9704 39.4892 12.2927 39.1688L41.536 9.92554C41.8541 9.60097 42.0308 9.16371 42.0276 8.70925C42.0244 8.2548 41.8415 7.82009 41.5188 7.50007ZM35.4121 11.1985L30.8364 6.62277L33.3135 4.16289L37.872 8.7214L35.4121 11.1985Z"
            fill="#D4D9E1"
          />
        </g>
      ),
      viewBox: '0 0 42 42'
    },
    reviewCheck: {
      path: (
        <g>
          <path
            d="M60 30C60 46.5685 46.5685 60 30 60C13.4315 60 0 46.5685 0 30C0 13.4315 13.4315 0 30 0C46.5685 0 60 13.4315 60 30ZM3 30C3 44.9117 15.0883 57 30 57C44.9117 57 57 44.9117 57 30C57 15.0883 44.9117 3 30 3C15.0883 3 3 15.0883 3 30Z"
            fill="#1AAB9B"
          />
          <circle cx="30" cy="30" r="25" fill="#1AAB9B" />
          <path
            d="M26.6857 39.3573L26.0412 38.7613L17.7215 31.0668C17.321 30.6964 17.2912 30.0734 17.6545 29.6666L18.9432 28.2235C19.3142 27.808 19.9531 27.7757 20.364 28.1517L27.3806 34.5699L39.6153 22.7129C40.0187 22.322 40.6648 22.3399 41.0459 22.7526L42.3376 24.1512C42.706 24.5501 42.6887 25.1701 42.2987 25.5479L28.6915 38.7301L28.0605 39.3414C27.6791 39.7108 27.0755 39.7178 26.6857 39.3573Z"
            fill="white"
          />
        </g>
      ),
      viewBox: '0 0 60 60'
    },
    reviewFailed: {
      path: (
        <g>
          <path
            d="M15.1502 44.8496C13.9786 43.6781 13.9786 41.7786 15.1502 40.607L40.606 15.1511C41.7776 13.9796 43.6771 13.9796 44.8487 15.1511C46.0202 16.3227 46.0202 18.2222 44.8487 19.3938L19.3928 44.8496C18.2212 46.0212 16.3217 46.0212 15.1502 44.8496Z"
            fill="#F77249"
          />
          <path
            d="M44.8487 44.8496C43.6771 46.0212 41.7776 46.0212 40.606 44.8496L15.1502 19.3938C13.9786 18.2222 13.9786 16.3227 15.1502 15.1511C16.3217 13.9796 18.2212 13.9796 19.3928 15.1511L44.8487 40.607C46.0202 41.7786 46.0202 43.6781 44.8487 44.8496Z"
            fill="#F77249"
          />
        </g>
      ),
      viewBox: '0 0 60 60'
    },
    arrowTopRight: {
      path: (
        <g>
          <path d="M3 1.5C3 1.22386 3.22386 1 3.5 1H9V2H3.5C3.22386 2 3 1.77614 3 1.5Z" fill="currentColor" />
          <path
            d="M8.5 7C8.22386 7 8 6.77614 8 6.5L8 1L9 1V6.5C9 6.77614 8.77614 7 8.5 7Z"
            fill="currentColor"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8.35355 1.64645C8.54882 1.84171 8.54882 2.15829 8.35355 2.35355L1.85355 8.85355C1.65829 9.04882 1.34171 9.04882 1.14645 8.85355C0.951184 8.65829 0.951184 8.34171 1.14645 8.14645L7.64645 1.64645C7.84171 1.45118 8.15829 1.45118 8.35355 1.64645Z"
            fill="currentColor"
          />
          <path
            d="M9 1H9.25V0.75H9V1ZM9 2V2.25H9.25V2H9ZM8 1V0.75L7.75 0.75V1L8 1ZM9 6.5H8.75H9ZM8 6.5H8.25H8ZM8.35355 2.35355L8.17678 2.17678L8.17678 2.17678L8.35355 2.35355ZM8.35355 1.64645L8.17678 1.82322L8.17678 1.82322L8.35355 1.64645ZM1.85355 8.85355L1.67678 8.67678L1.67678 8.67678L1.85355 8.85355ZM1.14645 8.85355L1.32322 8.67678L1.32322 8.67678L1.14645 8.85355ZM1.14645 8.14645L1.32322 8.32322H1.32322L1.14645 8.14645ZM7.64645 1.64645L7.82322 1.82322V1.82322L7.64645 1.64645ZM3.5 1.25H9V0.75H3.5V1.25ZM8.75 1V2H9.25V1H8.75ZM9 1.75H3.5V2.25H9V1.75ZM3.5 1.75C3.36193 1.75 3.25 1.63807 3.25 1.5H2.75C2.75 1.91421 3.08579 2.25 3.5 2.25V1.75ZM3.5 0.75C3.08579 0.75 2.75 1.08579 2.75 1.5H3.25C3.25 1.36193 3.36193 1.25 3.5 1.25V0.75ZM8.25 6.5L8.25 1L7.75 1L7.75 6.5H8.25ZM8 1.25L9 1.25V0.75L8 0.75V1.25ZM8.75 1V6.5H9.25V1H8.75ZM8.75 6.5C8.75 6.63807 8.63807 6.75 8.5 6.75V7.25C8.91421 7.25 9.25 6.91421 9.25 6.5H8.75ZM7.75 6.5C7.75 6.91421 8.08579 7.25 8.5 7.25V6.75C8.36193 6.75 8.25 6.63807 8.25 6.5H7.75ZM8.53033 2.53033C8.82322 2.23744 8.82322 1.76256 8.53033 1.46967L8.17678 1.82322C8.27441 1.92085 8.27441 2.07915 8.17678 2.17678L8.53033 2.53033ZM2.03033 9.03033L8.53033 2.53033L8.17678 2.17678L1.67678 8.67678L2.03033 9.03033ZM0.96967 9.03033C1.26256 9.32322 1.73744 9.32322 2.03033 9.03033L1.67678 8.67678C1.57915 8.77441 1.42085 8.77441 1.32322 8.67678L0.96967 9.03033ZM0.96967 7.96967C0.676777 8.26256 0.676777 8.73744 0.96967 9.03033L1.32322 8.67678C1.22559 8.57915 1.22559 8.42086 1.32322 8.32322L0.96967 7.96967ZM7.46967 1.46967L0.96967 7.96967L1.32322 8.32322L7.82322 1.82322L7.46967 1.46967ZM8.53033 1.46967C8.23744 1.17678 7.76256 1.17678 7.46967 1.46967L7.82322 1.82322C7.92085 1.72559 8.07915 1.72559 8.17678 1.82322L8.53033 1.46967Z"
            fill="currentColor"
          />
        </g>
      ),
      viewBox: '0 0 10 10'
    },
    stackedVotes: {
      path: (
        <g opacity="0.6">
          <path
            d="M8.82249 1.74963H1.77002V2.62445H8.82249C8.9385 2.62445 9.04975 2.67053 9.13178 2.75256C9.21381 2.83459 9.2599 2.94585 9.2599 3.06186V9.51945H10.1347V3.06186C10.1347 2.71383 9.99646 2.38006 9.75037 2.13397C9.50428 1.88789 9.17051 1.74963 8.82249 1.74963Z"
            fill="currentColor"
          />
          <path
            d="M10.5661 0H3.51514V0.874815H10.5661C10.6822 0.874815 10.7934 0.920899 10.8754 1.00293C10.9575 1.08496 11.0036 1.19622 11.0036 1.31222V7.76982H11.8784V1.31222C11.8784 0.9642 11.7401 0.630431 11.494 0.384341C11.2479 0.138252 10.9142 0 10.5661 0V0Z"
            fill="currentColor"
          />
          <path
            d="M7.37615 3.64508H0.874815C0.6428 3.64508 0.420287 3.73725 0.256227 3.90131C0.0921678 4.06537 0 4.28788 0 4.5199L0 10.0604C0 10.2924 0.0921678 10.5149 0.256227 10.679C0.420287 10.843 0.6428 10.9352 0.874815 10.9352H7.37615C7.60817 10.9352 7.83068 10.843 7.99474 10.679C8.1588 10.5149 8.25097 10.2924 8.25097 10.0604V4.5199C8.25097 4.28788 8.1588 4.06537 7.99474 3.90131C7.83068 3.73725 7.60817 3.64508 7.37615 3.64508ZM4.1787 8.72338C3.96561 8.93529 3.67731 9.05423 3.37679 9.05423C3.07627 9.05423 2.78796 8.93529 2.57487 8.72338L1.61841 7.76983L2.23661 7.15163L3.19016 8.10518C3.23934 8.15415 3.30592 8.18164 3.37533 8.18164C3.44473 8.18164 3.51131 8.15415 3.5605 8.10518L6.0129 5.65278L6.6311 6.26953L4.1787 8.72338Z"
            fill="currentColor"
          />
        </g>
      ),
      viewBox: '0 0 12 12'
    },
    magnifying_glass: {
      path: (
        <g>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M22.8433 22.439C26.7939 18.4883 26.7939 12.0831 22.8433 8.13243C18.8926 4.18179 12.4874 4.18179 8.53673 8.13243C4.58609 12.0831 4.58609 18.4883 8.53673 22.439C12.4874 26.3896 18.8926 26.3896 22.8433 22.439ZM26.4199 26.0156C32.3459 20.0896 32.3459 10.4818 26.4199 4.5558C20.4939 -1.37016 10.8861 -1.37016 4.9601 4.5558C-0.965866 10.4818 -0.965866 20.0896 4.9601 26.0156C10.8861 31.9416 20.4939 31.9416 26.4199 26.0156Z"
            fill="currentColor"
          />
          <path
            d="M21.0549 24.2273L24.6316 20.6507L37.1498 33.1689C38.1375 34.1565 38.1375 35.7578 37.1498 36.7455C36.1621 37.7332 34.5608 37.7332 33.5732 36.7455L21.0549 24.2273Z"
            fill="currentColor"
          />
        </g>
      ),
      viewBox: '0 0 38 38'
    },
    copy: {
      path: (
        <g>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M2.80039 4.59961C2.80039 3.71595 3.51674 2.99961 4.40039 2.99961H10.0004C10.884 2.99961 11.6004 3.71595 11.6004 4.59961V11.7996C11.6004 12.6833 10.884 13.3996 10.0004 13.3996H4.40039C3.51674 13.3996 2.80039 12.6833 2.80039 11.7996V4.59961ZM10.0004 4.59961H4.40039V11.7996H10.0004V4.59961Z"
            fill="#7E7E88"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0.400391 2.19961C0.400391 1.31595 1.11674 0.599609 2.00039 0.599609H8.40039V2.19961L2.00039 2.19961V10.1996H0.400391V2.19961Z"
            fill="#7E7E88"
          />
        </g>
      ),
      viewBox: '0 0 14 14'
    },
    burnSuccess: {
      path: (
        <g fill="none">
          <circle cx="59.5" cy="61.5" r="50.5" fill="#F77249" />
          <circle cx="59.5" cy="59.5" r="58" stroke="#1AAB9B" strokeWidth="3" />
          <path
            d="M78.3852 56.5501C77.8798 58.8584 76.6699 60.9037 74.9926 62.4731C72.9431 50.6107 65.1374 50.7562 65.1374 39.8253C65.1374 37.3417 65.4205 34.9444 65.9104 32.6431C54.9707 35.1541 46.6951 46.8112 46.6951 60.8338C46.6951 62.0937 46.7649 63.3346 46.8954 64.552C44.9952 62.0188 43.8693 58.8889 43.8693 55.4986C43.8693 53.4877 44.2752 51.5714 44.9926 49.8133C39.7768 53.8371 36.4146 60.0777 36.4146 67.1017C36.4146 78.3249 44.9694 87.5758 56.0158 88.9146C53.6709 87.1012 52.0945 83.7833 52.0945 79.9806C52.0945 74.2363 56.518 67.9182 58.7808 60.2582C61.0462 67.8572 68.1028 74.2363 68.1028 79.9806C68.1028 83.3462 66.8657 86.3305 64.9558 88.2315C74.3024 85.596 81.1431 77.138 81.1431 67.1011C81.1425 63.273 80.1407 59.6806 78.3852 56.5501Z"
            fill="white"
          />
        </g>
      ),
      viewBox: '0 0 119 119'
    },
    MetaMask: {
      path: (
        <g clipPath="url(#clip0)">
          <path d="M20.6123 2.44336L13.1533 8.03883L14.524 4.73095L20.6123 2.44336Z" fill="#E2761B" />
          <path d="M3.38867 2.44336L10.7839 8.09252L9.47699 4.73095L3.38867 2.44336Z" fill="#E4761B" />
          <path
            d="M17.9244 15.4277L15.9375 18.4993L20.1876 19.6807L21.4096 15.4922L17.9244 15.4277Z"
            fill="#E4761B"
          />
          <path
            d="M2.5918 15.4922L3.81371 19.6807L8.06385 18.4993L6.07691 15.4277L2.5918 15.4922Z"
            fill="#E4761B"
          />
          <path
            d="M7.82004 10.2299L6.64062 12.0342L10.8589 12.2275L10.7101 7.6416L7.82004 10.2299Z"
            fill="#E4761B"
          />
          <path
            d="M16.1709 10.2299L13.2489 7.58789L13.1533 12.2275L17.361 12.0342L16.1709 10.2299Z"
            fill="#E4761B"
          />
          <path d="M8.06445 18.4994L10.5933 17.2535L8.40446 15.5244L8.06445 18.4994Z" fill="#E4761B" />
          <path d="M13.3984 17.2535L15.9379 18.4994L15.5873 15.5244L13.3984 17.2535Z" fill="#E4761B" />
          <path
            d="M15.9379 18.4997L13.3984 17.2539L13.6003 18.9293L13.5791 19.6382L15.9379 18.4997Z"
            fill="#D7C1B3"
          />
          <path
            d="M8.06445 18.4997L10.4233 19.6382L10.4127 18.9293L10.5933 17.2539L8.06445 18.4997Z"
            fill="#D7C1B3"
          />
          <path d="M10.465 14.4187L8.35059 13.785L9.83813 13.0977L10.465 14.4187Z" fill="#233447" />
          <path d="M13.5254 14.4187L14.1523 13.0977L15.6505 13.785L13.5254 14.4187Z" fill="#233447" />
          <path d="M8.06409 18.4993L8.42535 15.4277L6.07715 15.4922L8.06409 18.4993Z" fill="#CD6116" />
          <path d="M15.5762 15.4277L15.9374 18.4993L17.9244 15.4922L15.5762 15.4277Z" fill="#CD6116" />
          <path
            d="M17.361 12.0342L13.1533 12.2275L13.5358 14.4184L14.1627 13.0974L15.6609 13.7848L17.361 12.0342Z"
            fill="#CD6116"
          />
          <path
            d="M8.35131 13.7848L9.84948 13.0974L10.4657 14.4184L10.8589 12.2275L6.64062 12.0342L8.35131 13.7848Z"
            fill="#CD6116"
          />
          <path
            d="M6.64062 12.0342L8.40443 15.5246L8.35131 13.7848L6.64062 12.0342Z"
            fill="#E4751F"
            stroke="#E4751F"
            strokeWidth="0.07"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15.6613 13.7848L15.5869 15.5246L17.3613 12.0342L15.6613 13.7848Z"
            fill="#E4751F"
            stroke="#E4751F"
            strokeWidth="0.07"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10.859 12.2275L10.4658 14.4185L10.9546 17.0068L11.0715 13.6022L10.859 12.2275Z"
            fill="#E4751F"
          />
          <path
            d="M13.154 12.2275L12.9521 13.5915L13.0372 17.0068L13.5365 14.4185L13.154 12.2275Z"
            fill="#E4751F"
          />
          <path
            d="M13.5365 14.4178L13.0371 17.0061L13.3984 17.2532L15.5872 15.524L15.6616 13.7842L13.5365 14.4178Z"
            fill="#F6851B"
          />
          <path
            d="M8.35059 13.7842L8.40371 15.524L10.5925 17.2532L10.9538 17.0061L10.465 14.4178L8.35059 13.7842Z"
            fill="#F6851B"
          />
          <path
            d="M13.579 19.6374L13.6003 18.9286L13.409 18.7568H10.5827L10.4127 18.9286L10.4233 19.6374L8.06445 18.499L8.89323 19.1864L10.5614 20.357H13.4303L15.1091 19.1864L15.9378 18.499L13.579 19.6374Z"
            fill="#C0AD9E"
          />
          <path
            d="M13.3978 17.2539L13.0366 17.0068H10.954L10.5927 17.2539L10.4121 18.9293L10.5821 18.7574H13.4085L13.5997 18.9293L13.3978 17.2539Z"
            fill="#161616"
          />
          <path
            d="M20.9212 8.40398L21.5693 5.3109L20.613 2.44336L13.3984 7.85625L16.1717 10.2298L20.0924 11.3897L20.9637 10.3586L20.5918 10.0901L21.1868 9.53166L20.7299 9.16651L21.3249 8.7047L20.9212 8.40398Z"
            fill="#763D16"
          />
          <path
            d="M2.44336 5.3109L3.08088 8.40398L2.66649 8.7047L3.27214 9.16651L2.81525 9.53166L3.41027 10.0901L3.03838 10.3586L3.89903 11.3897L7.81978 10.2298L10.593 7.85625L3.38902 2.44336L2.44336 5.3109Z"
            fill="#763D16"
          />
          <path
            d="M20.0921 11.3894L16.1713 10.2295L17.3613 12.0338L15.5869 15.5242L17.9245 15.492H21.4096L20.0921 11.3894Z"
            fill="#F6851B"
          />
          <path
            d="M7.81947 10.2295L3.89871 11.3894L2.5918 15.492H6.07691L8.40386 15.5242L6.64005 12.0338L7.81947 10.2295Z"
            fill="#F6851B"
          />
          <path
            d="M13.1539 12.2269L13.3983 7.85577L14.5352 4.73047H9.47754L10.5932 7.85577L10.8588 12.2269L10.9545 13.6016V17.0061H13.037L13.0477 13.6016L13.1539 12.2269Z"
            fill="#F6851B"
          />
        </g>
      ),
      viewBox: '0 0 24 24'
    },
    WalletConnect: {
      path: (
        <path
          d="M4.09631 2.54825C7.35706 -0.816865 12.6438 -0.816865 15.9045 2.54825L16.297 2.95325C16.46 3.1215 16.46 3.3943 16.297 3.56255L14.9545 4.94797C14.873 5.0321 14.7408 5.0321 14.6593 4.94797L14.1193 4.39064C11.8445 2.04306 8.15635 2.04306 5.88157 4.39064L5.30323 4.98749C5.22171 5.07162 5.08954 5.07162 5.00802 4.98749L3.66558 3.60208C3.50254 3.43382 3.50254 3.16103 3.66558 2.99277L4.09631 2.54825ZM18.6808 5.41343L19.8756 6.64646C20.0387 6.81471 20.0387 7.08751 19.8756 7.25576L14.4883 12.8156C14.3252 12.9839 14.0609 12.9839 13.8979 12.8156C13.8979 12.8156 13.8979 12.8156 13.8979 12.8156L10.0742 8.86963C10.0335 8.82757 9.9674 8.82757 9.92665 8.86963C9.92665 8.86963 9.92664 8.86963 9.92664 8.86963L6.10312 12.8156C5.94008 12.9839 5.67574 12.9839 5.51271 12.8156C5.5127 12.8156 5.5127 12.8156 5.5127 12.8156L0.125208 7.25569C-0.0378297 7.08744 -0.0378297 6.81464 0.125208 6.64638L1.31999 5.41336C1.48303 5.24511 1.74736 5.24511 1.9104 5.41336L5.73407 9.35941C5.77483 9.40148 5.84091 9.40148 5.88167 9.35941C5.88167 9.35941 5.88167 9.35941 5.88167 9.35941L9.70514 5.41336C9.86818 5.2451 10.1325 5.2451 10.2956 5.41335C10.2956 5.41335 10.2956 5.41335 10.2956 5.41335L14.1192 9.35941C14.16 9.40147 14.2261 9.40147 14.2668 9.35941L18.0904 5.41343C18.2535 5.24518 18.5178 5.24518 18.6808 5.41343Z"
          fill="black"
        />
      ),
      viewBox: '0 0 20 13'
    },
    'Coinbase Wallet': {
      path: (
        <g>
          <circle cx="10" cy="10" r="10" fill="url(#paint10_linear)" />
          <circle cx="10" cy="10" r="6" fill="white" />
          <rect x="8" y="8" width="4" height="4" rx="0.3" fill="#2058EA" />
          <defs>
            <linearGradient id="paint10_linear" x1="10" y1="0" x2="10" y2="20" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2B63F6" />
              <stop offset="1" stopColor="#144CDE" />
            </linearGradient>
          </defs>
        </g>
      ),
      viewBox: '0 0 20 20'
    },
    WalletLink: {
      path: (
        <g>
          <rect width="20" height="20" rx="2" fill="#5410F5" />
          <path
            d="M2.95788 11.2887L2.48242 9.08299H2.8723L3.13539 10.3812C3.15863 10.503 3.17131 10.5734 3.17342 10.5923C3.17976 10.5461 3.19456 10.4757 3.2178 10.3812L3.54428 9.08299H3.8676L4.20042 10.378C4.22155 10.4537 4.23634 10.524 4.2448 10.5892C4.25325 10.5282 4.26593 10.4589 4.28283 10.3812L4.54592 9.08299H4.92946L4.45083 11.2887H4.10216L3.74398 9.9243C3.72073 9.84238 3.70594 9.77411 3.6996 9.71949C3.69326 9.76991 3.67953 9.83713 3.65839 9.92115L3.30655 11.2887H2.95788Z"
            fill="white"
          />
          <path
            d="M6.10355 11.2887V11.1595C5.99578 11.2708 5.85208 11.3265 5.67246 11.3265C5.49919 11.3265 5.3576 11.2803 5.24772 11.1878C5.13995 11.0933 5.08606 10.961 5.08606 10.7908C5.08606 10.6165 5.14734 10.4841 5.26991 10.3938C5.39458 10.3035 5.54462 10.2583 5.72001 10.2583C5.87427 10.2583 6.00212 10.2867 6.10355 10.3434V10.2583C6.10355 10.1554 6.07713 10.0808 6.0243 10.0346C5.97359 9.98837 5.89435 9.96527 5.78657 9.96527C5.61118 9.96527 5.45058 10.0157 5.30477 10.1165L5.19066 9.81717C5.36606 9.69953 5.57737 9.64072 5.82461 9.64072C5.90914 9.64072 5.9831 9.64807 6.04649 9.66277C6.112 9.67538 6.17857 9.70164 6.24619 9.74155C6.31592 9.78146 6.36981 9.84448 6.40784 9.93061C6.44588 10.0167 6.4649 10.1239 6.4649 10.252V11.2887H6.10355ZM5.7422 11.0019C5.88378 11.0019 6.00423 10.9505 6.10355 10.8475V10.6396C6.01057 10.5955 5.9028 10.5734 5.78023 10.5734C5.68092 10.5734 5.60062 10.5913 5.53934 10.627C5.47805 10.6627 5.44741 10.7173 5.44741 10.7908C5.44741 10.8559 5.47277 10.9074 5.52349 10.9452C5.5742 10.983 5.64711 11.0019 5.7422 11.0019Z"
            fill="white"
          />
          <path d="M6.92426 11.2887V9.18698L7.29512 9.01367V11.2887H6.92426Z" fill="white" />
          <path d="M7.80337 11.2887V9.18698L8.17423 9.01367V11.2887H7.80337Z" fill="white" />
          <path
            d="M9.33544 11.3265C9.10511 11.3265 8.92232 11.2519 8.78708 11.1028C8.65395 10.9515 8.58738 10.7446 8.58738 10.482C8.58738 10.2215 8.655 10.0167 8.79025 9.86759C8.92549 9.71634 9.10722 9.64072 9.33544 9.64072C9.54253 9.64072 9.71158 9.70479 9.8426 9.83293C9.97573 9.96107 10.0423 10.1491 10.0423 10.397C10.0423 10.4831 10.0381 10.5587 10.0296 10.6238H8.95507C8.96141 10.7373 9.0005 10.8286 9.07235 10.898C9.14631 10.9673 9.23401 11.0019 9.33544 11.0019C9.47914 11.0019 9.59325 10.9463 9.67777 10.8349L9.91233 11.0744C9.77075 11.2425 9.57845 11.3265 9.33544 11.3265ZM8.95824 10.3182H9.6746C9.66615 10.2026 9.63023 10.1155 9.56683 10.0566C9.50344 9.99573 9.42631 9.96527 9.33544 9.96527C9.22978 9.96527 9.14209 9.99468 9.07235 10.0535C9.00473 10.1102 8.96669 10.1984 8.95824 10.3182Z"
            fill="white"
          />
          <path
            d="M10.8724 11.3265C10.621 11.3265 10.4952 11.1889 10.4952 10.9137V9.99993H10.2543V9.67853H10.4952V9.19013L10.8661 9.01367V9.67853H11.2401V9.99993H10.8661V10.8412C10.8661 10.9442 10.9115 10.9956 11.0024 10.9956C11.0848 10.9956 11.1693 10.9715 11.256 10.9232L11.2116 11.254C11.1186 11.3023 11.0056 11.3265 10.8724 11.3265Z"
            fill="white"
          />
          <path d="M11.6514 11.2887V9.08299H12.0317V10.9263H13.1095V11.2887H11.6514Z" fill="white" />
          <path
            d="M13.7574 9.39494C13.7152 9.43695 13.6634 9.45796 13.6021 9.45796C13.5408 9.45796 13.488 9.43695 13.4436 9.39494C13.4014 9.35083 13.3802 9.29831 13.3802 9.23739C13.3802 9.17647 13.4014 9.12501 13.4436 9.08299C13.488 9.04098 13.5408 9.01997 13.6021 9.01997C13.6634 9.01997 13.7152 9.04098 13.7574 9.08299C13.7997 9.12501 13.8208 9.17647 13.8208 9.23739C13.8208 9.29831 13.7997 9.35083 13.7574 9.39494ZM13.4151 11.2887V9.67853H13.786V11.2887H13.4151Z"
            fill="white"
          />
          <path
            d="M15.2648 11.2887V10.3654C15.2648 10.1155 15.1645 9.99047 14.9637 9.99047C14.7439 9.99047 14.6341 10.1134 14.6341 10.3591V11.2887H14.2632V9.67853H14.6341V9.82978C14.7397 9.70374 14.8823 9.64072 15.062 9.64072C15.231 9.64072 15.3684 9.69323 15.474 9.79827C15.5818 9.9033 15.6357 10.0703 15.6357 10.2993V11.2887H15.2648Z"
            fill="white"
          />
          <path
            d="M17.5157 11.2887H17.11L16.6472 10.4001L16.4666 10.5766V11.2887H16.0957V9.18698L16.4666 9.01367V10.1449L16.923 9.67853H17.3731L16.9135 10.1354L17.5157 11.2887Z"
            fill="white"
          />
        </g>
      ),
      viewBox: '0 0 20 20'
    },
    darkMode: {
      viewBox: '0 0 22 22',
      path: (
        <path
          d="M14.8524 3.89423C13.0174 2.89993 10.8669 2.6614 8.85981 3.22953C6.85271 3.79766 5.14794 5.12747 4.10926 6.9352C3.58447 7.84407 3.24404 8.84751 3.10739 9.88824C2.97073 10.929 3.04053 11.9866 3.31281 13.0007C3.5851 14.0149 4.05453 14.9656 4.6943 15.7988C5.33406 16.6319 6.13164 17.3311 7.04148 17.8564C7.95133 18.3817 8.95563 18.7228 9.99703 18.8603C11.0384 18.9978 12.0966 18.929 13.111 18.6577C14.1254 18.3864 15.0762 17.9181 15.9092 17.2794C16.7421 16.6406 17.4409 15.8441 17.9656 14.9352C18.5021 14.0105 18.8474 12.9874 18.981 11.9265C19.1146 10.8657 19.0339 9.7886 18.7436 8.75909C18.4533 7.72959 17.9594 6.76857 17.291 5.93294C16.6226 5.09732 15.7934 4.40405 14.8524 3.89423ZM14.6698 4.64375L7.40508 17.2267C5.75289 16.2532 4.55166 14.6672 4.06284 12.814C3.57401 10.9607 3.83715 8.99011 4.79498 7.3311C5.7528 5.6721 7.32778 4.45896 9.17717 3.95566C11.0266 3.45236 13.0007 3.69967 14.6698 4.64375Z"
          fill="currentColor"
        />
      )
    },
    discord: {
      viewBox: '0 0 21 16',
      path: (
        <path
          d="M18.0905 1.77366C16.2731 0.2673 13.398 0.0124677 13.2758 0.00164474C13.084 -0.0150817 12.9016 0.0970838 12.8234 0.278123C12.8176 0.28993 12.7546 0.4385 12.685 0.669719C13.8867 0.878307 15.3634 1.29942 16.6998 2.15444C16.9136 2.2912 16.9795 2.58145 16.8468 2.80283C16.7609 2.94648 16.611 3.0252 16.4583 3.0252C16.3762 3.0252 16.2931 3.00257 16.2177 2.95435C13.9211 1.48636 11.0517 1.41257 10.5 1.41257C9.94827 1.41257 7.07795 1.48636 4.78323 2.95435C4.56845 3.0921 4.28782 3.02323 4.15418 2.80283C4.02055 2.58145 4.08736 2.29218 4.30118 2.15444C5.63755 1.3004 7.11327 0.878307 8.316 0.669719C8.24536 0.437516 8.18236 0.28993 8.17759 0.278123C8.09836 0.0970838 7.917 -0.0170496 7.72418 0.00262857C7.60295 0.0124677 4.72786 0.2673 2.88559 1.79531C1.92341 2.71133 0 8.07166 0 12.7059C0 12.7875 0.021 12.8682 0.0601363 12.9391C1.38791 15.3427 5.00945 15.9725 5.83514 16C5.83991 16 5.84468 16 5.84945 16C5.9955 16 6.13295 15.9282 6.21886 15.8062L7.05409 14.6235C4.80232 14.0233 3.65209 13.005 3.58527 12.945C3.39627 12.7728 3.37814 12.4756 3.54518 12.2808C3.71223 12.086 3.99955 12.0673 4.18855 12.2385C4.21623 12.2641 6.33436 14.1168 10.5 14.1168C14.6733 14.1168 16.7914 12.2562 16.8124 12.2375C17.0014 12.0683 17.2897 12.086 17.4558 12.2818C17.6219 12.4766 17.6037 12.7728 17.4157 12.944C17.3489 13.005 16.1986 14.0223 13.9469 14.6225L14.7821 15.8052C14.868 15.9272 15.0055 15.999 15.1515 15.999C15.1563 15.999 15.161 15.999 15.1658 15.999C15.9915 15.9724 19.613 15.3427 20.9408 12.9381C20.979 12.8672 21 12.7875 21 12.7059C21 8.07166 19.0766 2.71133 18.0905 1.77366ZM7.53232 10.8237C6.65032 10.8237 5.93441 9.98045 5.93441 8.94144C5.93441 7.90243 6.64936 7.05922 7.53232 7.05922C8.41527 7.05922 9.13023 7.90243 9.13023 8.94144C9.13023 9.98045 8.41527 10.8237 7.53232 10.8237ZM13.4677 10.8237C12.5857 10.8237 11.8698 9.98045 11.8698 8.94144C11.8698 7.90243 12.5847 7.05922 13.4677 7.05922C14.3497 7.05922 15.0656 7.90243 15.0656 8.94144C15.0656 9.98045 14.3497 10.8237 13.4677 10.8237Z"
          fill="currentColor"
        />
      )
    },
    hourglass: {
      viewBox: '0 0 14 18',
      path: (
        <g>
          <path
            d="M12.6667 1.66667H1.33333C1.14933 1.66667 1 1.51733 1 1.33333C1 1.14933 1.14933 1 1.33333 1H12.6667C12.8507 1 13 1.14933 13 1.33333C13 1.51733 12.8507 1.66667 12.6667 1.66667Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="0.6"
          />
          <path
            d="M2.66536 17C2.48136 17 2.33203 16.8507 2.33203 16.6667V13.1873C2.33203 12.3387 2.69403 11.526 3.3247 10.9573L4.6747 9.74333C4.88803 9.55133 5.00603 9.28733 5.00603 9C5.00603 8.71267 4.88803 8.44867 4.6747 8.25667L3.32536 7.042C2.69403 6.474 2.33203 5.66133 2.33203 4.81267V1.33333C2.33203 1.14933 2.48136 1 2.66536 1C2.84936 1 2.9987 1.14933 2.9987 1.33333V4.81267C2.9987 5.47267 3.28003 6.10467 3.77136 6.54733L5.12003 7.76133C5.4707 8.07733 5.67203 8.52867 5.67203 9C5.67203 9.47133 5.4707 9.92333 5.1207 10.2387L3.7707 11.4533C3.28003 11.8953 2.9987 12.5273 2.9987 13.1873V16.6667C2.9987 16.8507 2.84936 17 2.66536 17V17Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="0.6"
          />
          <path
            d="M11.3348 17C11.1508 17 11.0015 16.8507 11.0015 16.6667V13.1873C11.0015 12.5273 10.7201 11.8953 10.2288 11.4527L8.88013 10.2387C8.52946 9.92267 8.32812 9.47133 8.32812 9C8.32812 8.52867 8.52946 8.07667 8.87946 7.76133L10.2295 6.54733C10.7201 6.10467 11.0015 5.47267 11.0015 4.81267V1.33333C11.0015 1.14933 11.1508 1 11.3348 1C11.5188 1 11.6681 1.14933 11.6681 1.33333V4.81267C11.6681 5.66133 11.3061 6.474 10.6755 7.04267L9.32546 8.25667C9.11279 8.44933 8.99479 8.71333 8.99479 9C8.99479 9.28667 9.11279 9.55133 9.32613 9.74333L10.6748 10.9573C11.3061 11.526 11.6681 12.338 11.6681 13.1873V16.6667C11.6681 16.8507 11.5188 17 11.3348 17Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="0.6"
          />
          <path
            d="M12.6667 17.0007H1.33333C1.14933 17.0007 1 16.8513 1 16.6673C1 16.4833 1.14933 16.334 1.33333 16.334H12.6667C12.8507 16.334 13 16.4833 13 16.6673C13 16.8513 12.8507 17.0007 12.6667 17.0007Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="0.6"
          />
        </g>
      )
    },
    decrease: {
      viewBox: '0 0 8 7',
      path: (
        <g>
          <path
            d="M6.97438 1.90227C7.19442 1.90227 7.3728 2.08065 7.3728 2.30069L7.3728 6.68329L6.57597 6.68329L6.57597 2.30069C6.57597 2.08065 6.75434 1.90227 6.97438 1.90227Z"
            fill="currentColor"
          />
          <path
            d="M2.59178 6.28487C2.59178 6.06483 2.77016 5.88645 2.9902 5.88645L7.3728 5.88645L7.3728 6.68329L2.9902 6.68329C2.77016 6.68329 2.59178 6.50491 2.59178 6.28487Z"
            fill="currentColor"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6.85769 6.16818C6.7021 6.32377 6.44983 6.32377 6.29424 6.16818L1.1148 0.988736C0.959209 0.833144 0.959209 0.58088 1.1148 0.425288C1.27039 0.269695 1.52266 0.269695 1.67825 0.425288L6.85769 5.60473C7.01328 5.76032 7.01328 6.01258 6.85769 6.16818Z"
            fill="currentColor"
          />
        </g>
      )
    },
    increase: {
      viewBox: '0 0 8 8',
      path: (
        <g>
          <path
            d="M2.59178 1.14842C2.59178 0.928378 2.77016 0.75 2.9902 0.75H7.3728V1.54684H2.9902C2.77016 1.54684 2.59178 1.36846 2.59178 1.14842Z"
            fill="currentColor"
          />
          <path
            d="M6.97438 5.53102C6.75434 5.53102 6.57597 5.35264 6.57597 5.1326L6.57597 0.75L7.3728 0.75V5.1326C7.3728 5.35264 7.19442 5.53102 6.97438 5.53102Z"
            fill="currentColor"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6.85769 1.26511C7.01328 1.4207 7.01328 1.67297 6.85769 1.82856L1.67825 7.008C1.52266 7.16359 1.27039 7.16359 1.1148 7.008C0.95921 6.85241 0.95921 6.60014 1.1148 6.44455L6.29424 1.26511C6.44983 1.10952 6.7021 1.10952 6.85769 1.26511Z"
            fill="currentColor"
          />
        </g>
      )
    },
    minus: {
      viewBox: '0 0 6 3',
      path: <path d="M5.6463 2.125V0.851562H0.521296V2.125H5.6463Z" fill="currentColor" />
    },
    plus: {
      viewBox: '0 0 9 9',
      path: (
        <path
          d="M4.66192 5.35938H8.06036V4.20312H4.66192V0.804688H3.50567V4.20312H0.107233V5.35938H3.50567V8.75781H4.66192V5.35938Z"
          fill="currentColor"
        />
      )
    },
    shadowQuestion: {
      viewBox: '0 0 15 15',
      path: (
        <g>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12.8497 7.85825C12.5173 7.51711 12.4431 6.99754 12.6668 6.57564C12.8265 6.27481 12.8375 5.91586 12.697 5.60551C12.5565 5.29505 12.2802 5.06858 11.9501 4.9931C11.4872 4.88737 11.1464 4.49067 11.1084 4.01378C11.0814 3.67364 10.8982 3.36553 10.6135 3.18106C10.3287 2.9966 9.97499 2.95662 9.65691 3.0731C9.21071 3.23639 8.71141 3.08844 8.4238 2.70798C8.2185 2.43672 7.8993 2.27734 7.56095 2.27734C7.22249 2.27734 6.9034 2.43672 6.69811 2.70809C6.41049 3.08844 5.91097 3.23639 5.4651 3.0731C5.14691 2.95662 4.79299 2.9966 4.5084 3.18106C4.22359 3.36553 4.04047 3.67352 4.01336 4.01378C3.9754 4.49067 3.63447 4.88726 3.1718 4.9931C2.84162 5.06858 2.56532 5.29505 2.42476 5.60562C2.28409 5.91597 2.29529 6.27481 2.455 6.57575C2.67878 6.99765 2.60452 7.51711 2.27199 7.85837C2.03478 8.10185 1.92379 8.44289 1.97206 8.78079C2.02022 9.11858 2.22193 9.41426 2.51761 9.58058C2.93201 9.81353 3.14828 10.2909 3.05151 10.7591C2.98252 11.0931 3.07212 11.4405 3.29377 11.6987C3.51541 11.9566 3.8438 12.0955 4.1817 12.0741C4.65535 12.0441 5.09315 12.3279 5.26272 12.7748C5.3839 13.0935 5.64554 13.3368 5.97033 13.433C6.29502 13.5292 6.6458 13.4669 6.91852 13.2648C7.30089 12.9815 7.82146 12.9815 8.20361 13.2648C8.47655 13.4669 8.827 13.5292 9.15191 13.433C9.4766 13.3368 9.73834 13.0935 9.85941 12.7748C10.0291 12.3279 10.467 12.0442 10.9405 12.0741C11.2783 12.0955 11.6066 11.9566 11.8283 11.6987C12.05 11.4405 12.1395 11.0932 12.0706 10.7591C11.9739 10.2908 12.1899 9.81353 12.6044 9.58058C12.9002 9.41437 13.102 9.11858 13.15 8.78079C13.198 8.44278 13.0871 8.10174 12.8497 7.85825Z"
            fill="currentColor"
          />
          <path
            d="M5.50255 6.73009H6.56804C6.60431 6.17694 6.98064 5.82329 7.56552 5.82329C8.13681 5.82329 8.51766 6.16334 8.51766 6.63488C8.51766 7.08374 8.32723 7.32404 7.76502 7.66409C7.13933 8.03135 6.87635 8.43941 6.91716 9.11951L6.92169 9.42782H7.97358V9.16938C7.97358 8.72052 8.14134 8.48928 8.73529 8.14016C9.35192 7.77291 9.6965 7.28777 9.6965 6.59407C9.6965 5.59206 8.86678 4.87568 7.62446 4.87568C6.27786 4.87568 5.53882 5.65553 5.50255 6.73009ZM7.49751 11.5905C7.95998 11.5905 8.25016 11.3049 8.25016 10.8696C8.25016 10.4298 7.95998 10.1442 7.49751 10.1442C7.04411 10.1442 6.74487 10.4298 6.74487 10.8696C6.74487 11.3049 7.04411 11.5905 7.49751 11.5905Z"
            fill="white"
          />
        </g>
      )
    }
  }
};
