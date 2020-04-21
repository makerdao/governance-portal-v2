const theme = {
  useBorderBox: true,
  useBodyStyles: true,

  breakpoints: ['40em', '52em', '64em'],

  colors: {
    primary: '#1AAB9B',
    secondary: '#F4B731',
    text: '#231536',
    muted: '#D4D9E1',
    grey2: '#E2E9EC',
    background: '#F6F8F9',
    white: '#fff',
    sidebar: '#1E2C37',
    subText: '#48495F',
    lightText: '#708390',
    accent: '#447AFB',
    green1: '#098C7D',
    green2: '#139D8D',
    green3: '#B6EDE7',
    highlight: '#E7FCFA',
    yellow1: '#E47F09',
    yellow2: '#FBCC5F',
    yellow3: '#FFF9ED',
    red1: '#CB532D',
    red2: '#FA7249',
    red3: '#FFF2EE',
  },

  fonts: {
    body:
      '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu',
    heading:
      '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu',
    monospace: 'monospace',
  },

  fontSizes: [10, 12, 14, 16, 18, 20, 24, 32, 48, 64, 96],

  fontWeights: {
    body: 400,
    heading: 700,
    bold: 700,
    semiBold: 500,
  },

  lineHeights: {
    body: 1.5,
    heading: 1.125,
    tight: 1.05,
    loose: 1.2,
  },

  borders: {
    light: '1px solid',
  },

  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  sizes: [0, 4, 8, 16, 32, 64, 128, 256, 512],

  radii: {
    xs: 2,
    small: 4,
    medium: 6,
    roundish: 12,
    round: 24,
  },

  shadows: {
    floater: '0 0 8px rgba(0, 0, 0, 0.125)',
    deep: '2px 2px 8px rgba(0, 0, 0, 0.925)',
  },
  alerts: {
    primary: {
      borderRadius: 'xs',
      border: '1px solid',
      borderColor: 'green1',
      bg: 'highlight',
      color: 'green1',
    },
    danger: {
      variant: 'alerts.primary',
      borderColor: 'red1',
      bg: 'red3',
      color: 'red1',
    },
    warning: {
      variant: 'alerts.primary',
      borderColor: 'yellow1',
      bg: 'yellow3',
      color: 'yellow1',
    },
  },
  badges: {
    primary: {
      py: 1,
      px: 4,
      borderRadius: 'roundish',
      variant: 'text.caps',
      color: 'primary',
      bg: 'white',
      border: '1px solid',
      borderColor: 'primary',
    },
    warning: {
      variant: 'badges.primary',
      borderColor: 'yellow1',
      color: 'yellow1',
    },
    danger: {
      variant: 'badges.primary',
      borderColor: 'red1',
      color: 'red1',
    },
  },

  buttons: {
    primary: {
      borderRadius: 'xs',
      cursor: 'pointer',
      maxWidth: ['100%', '224px'],
      outline: 'none',
      fontFamily: 'body',
      fontSize: 2,
      p: 3,
      color: 'white',
      fontWeight: 'semiBold',
      letterSpacing: '0.03em',
      bg: 'primary',
      '&:hover': {
        bg: 'green2',
      },
      '&:active': {
        bg: 'green1',
      },
      '&:disabled': {
        bg: 'green3',
        pointerEvents: 'none',
        cursor: 'not-allowed',
      },
    },
    outline: {
      variant: 'buttons.primary',
      bg: 'white',
      color: 'subText',
      border: '1px solid',
      borderColor: 'muted',
      '&:hover': {
        bg: 'transparent',
        color: 'lightText',
        borderColor: 'lightText',
      },
      '&:active': {
        borderColor: 'text',
        color: 'text',
      },
      '&:disabled': {
        bg: 'background',
        pointerEvents: 'none',
        cursor: 'not-allowed',
        borderColor: 'muted',
        opacity: 0.5,
      },
    },

    small: {
      variant: 'buttons.primary',
      textTransform: 'uppercase',
      outline: 'none',
      letterSpacing: '0.05em',
      fontSize: 0,
      fontWeight: 'bold',
      cursor: 'pointer',
      p: 2,
      color: 'white',
      bg: 'primary',
      border: '1px solid',
      borderColor: 'primary',
      '&:hover': {
        bg: 'green2',
      },
      '&:active': {
        bg: 'green1',
      },
      '&:disabled': {
        opacity: 0.5,
        // bg: 'lightGreen',
        pointerEvents: 'none',
        cursor: 'not-allowed',
      },
    },
    smallOutline: {
      variant: 'buttons.small',
      bg: 'transparent',
      color: 'lightText',
      border: '1px solid',
      borderColor: 'muted',
      '&:hover': {
        bg: 'transparent',
        color: 'subText',
        borderColor: 'lightText',
      },
      '&:active': {
        bg: 'transparent',
        borderColor: 'text',
        color: 'text',
      },
    },
    clear: {
      bg: 'transparent',
      p: 1,
    },
    close: {
      color: 'black',
    },
    menu: {
      color: 'black',
    },
    icon: {},
    textual: {
      background: 'transparent',
      color: 'accent',
      outline: 'none',
      cursor: 'pointer',
      fontSize: 1,
    },
  },

  forms: {
    label: {
      fontSize: 3,
      fontWeight: 'semiBold',
      py: 2,
    },
    input: {
      outline: 'none',
      borderRadius: 'small',
      borderColor: 'muted',
      color: 'lightText',
      p: 2,
      '&:focus': {
        borderColor: 'subText',
        color: 'text',
      },
    },
    inputDanger: {
      variant: 'forms.input',
      borderColor: 'red1',
      color: 'text',
      '&:focus': {
        borderColor: 'red1',
        color: 'text',
      },
    },
    textarea: { variant: 'forms.input' },
    textareaDanger: { variant: 'forms.inputDanger' },
    select: { variant: 'forms.input' },
    slider: {
      height: '2px',
      borderRadius: 'small',
      color: 'text',
    },
    sliderActive: {
      variant: 'forms.slider',
      color: 'primary',
      bg: 'primary',
    },
    radio: {
      color: 'muted',
      'input:checked ~ &': {
        color: 'primary',
      },
      'input:focus ~ &': {
        bg: 'highlight',
      },
    },
    checkbox: {
      color: 'muted',
      'input:checked ~ &': {
        color: 'primary',
      },
      'input:focus ~ &': {
        color: 'primary',
        bg: 'highlight',
      },
    },
  },
  cards: {
    primary: {
      border: '1px solid',
      borderColor: 'muted',
      p: 3,
      borderRadius: 'medium',
      bg: 'white',
    },
  },
  messages: {}, // Defaults to "primary" & "highlight"
  text: {
    heading: {
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
    },

    caps: {
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: 'subText',
      fontSize: 0,
      fontWeight: 'bold',
    },

    h1: {
      fontSize: 8,
      letterSpacing: '0.3px',
      fontWeight: 'semiBold',
    },

    h2: {
      fontSize: 6,
      lineHeight: 'loose',
      fontWeight: 'semiBold',
      letterSpacing: '0.4px',
    },

    bigText: {
      fontSize: 8,
    },
    boldBody: {
      fontSize: 3,
      fontWeight: 'semiBold',
      letterSpacing: '0.3px',
    },
    small: {
      fontSize: 1,
    },
    inputText: {
      fontSize: 3,
      fontWeight: 'normal',
    },
    smallDanger: {
      fontSize: 2,
      color: 'red1',
    },
    muted: {
      color: 'muted',
      fontSize: 4,
      lineHeight: 'body',
    },
  },
  links: {
    nav: {
      p: 2,
      fontSize: 5,
      fontWeight: 'body',
      letterSpacing: '0.4px',
      color: 'text',
      cursor: 'pointer',
      '&:hover': {
        color: 'primary',
        cursor: 'pointer',
      },
    },

    footer: {
      fontSize: 4,
      fontWeight: 'semiBold',
      letterSpacing: '0.4px',
      color: 'text',
      cursor: 'pointer',
    },
  },
  images: {
    avatar: {},
  },
  styles: {
    spinner: {
      color: 'primary',
      strokeWidth: 3,
      size: 4,
    },
    donut: {
      color: 'primary',
      strokeWidth: 3,
      size: 6,
    },
    time: {
      display: 'inline',
      major: {
        fontSize: 4,
        fontWeight: 'semiBold',
      },
      minor: {
        fontSize: 1,
        fontWeight: 'body',
        color: 'lightText',
      },
    },
    root: {
      fontFamily: 'body',
      lineHeight: 'body',
      fontWeight: 'body',
    },
    statusBox: {
      layout: {
        border: '1px solid',
        borderRadius: 'medium',
        fontSize: 2,
        fontWeight: 'bold',
        py: 3,
        px: 4,
        mt: 7,
        lineHeight: 'body',
        width: '100%',
      },
      warning: {
        variant: 'styles.statusBox.layout',
        bg: 'yellow3',
        borderColor: 'yello1',
        color: 'yellow1',
      },
      success: {
        variant: 'styles.statusBox.layout',
        bg: 'highlight',
        borderColor: 'green1',
        color: 'green1',
      },
    },
    h1: {
      variant: 'text.heading',
      fontSize: 7,
    },
    h2: {
      variant: 'text.heading',
      fontSize: 6,
      fontWeight: 'body',
    },
    h3: {
      variant: 'text.heading',
      fontSize: 4,
      py: 4,
      pb: 3,
      fontWeight: 500,
    },
    h4: {
      variant: 'text.heading',
      fontSize: 4,
    },
    h5: {
      variant: 'text.heading',
      fontSize: 3,
    },
    a: {
      color: 'accent',
      textDecoration: 'none',
    },
    hr: {},
  },
  layout: {
    container: {
      px: 2,
    },
  },
};

theme.sizes.container = 1140;

export default theme;
