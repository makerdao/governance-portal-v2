export const buttons = {
  primary: {
    borderRadius: 'round',
    cursor: 'pointer',
    outline: 'none',
    fontFamily: 'body',
    fontSize: 2,
    px: 3,
    py: 2,
    color: 'onPrimary',
    fontWeight: 'semiBold',
    letterSpacing: '0.03em',
    bg: 'primary',
    '&:hover': {
      bg: 'primaryEmphasis'
    },
    '&:active': {
      bg: 'primaryAlt'
    },
    '&:disabled': {
      bg: 'primaryMuted',
      pointerEvents: 'none',
      cursor: 'not-allowed'
    }
  },
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
  outline: {
    variant: 'buttons.primary',
    bg: 'surface',
    color: 'text',
    border: '1px solid',
    '&:hover': {
      bg: 'surface',
      color: 'text',
      borderColor: 'secondaryEmphasis'
    },
    '&:active': {
      borderColor: 'secondaryAlt',
      color: 'secondaryAlt'
    },
    '&:disabled': {
      bg: 'background',
      pointerEvents: 'none',
      cursor: 'not-allowed',
      borderColor: 'secondaryMuted',
      opacity: 0.5
    },
    borderColor: 'outline'
  },
  mutedOutline: {
    variant: 'buttons.outline',
    color: 'textSecondary',
    borderColor: 'secondaryMuted',
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
    color: 'onPrimary',
    bg: 'primary',
    '&:hover': {
      bg: 'primaryEmphasis'
    },
    '&:active': {
      bg: 'primaryAlt'
    },
    '&:disabled': {
      bg: 'primaryMuted',
      pointerEvents: 'none',
      cursor: 'not-allowed'
    }
  },
  smallOutline: {
    variant: 'buttons.small',
    bg: 'surface',
    color: 'text',
    border: '1px solid',
    borderColor: 'onSurface',
    '&:hover': {
      bg: 'surface',
      color: 'secondaryEmphasis',
      borderColor: 'secondaryEmphasis'
    },
    '&:active': {
      bg: 'surface',
      borderColor: 'secondaryAlt',
      color: 'secondaryAlt'
    },
    '&:disabled': {
      bg: 'background',
      pointerEvents: 'none',
      cursor: 'not-allowed',
      borderColor: 'secondaryMuted',
      opacity: 0.5
    }
  },
  textual: {
    background: 'transparent',
    color: 'accentBlue',
    outline: 'none',
    cursor: 'pointer',
    fontSize: 1
  }
};
