export const badges = {
  primary: {
    variant: 'text.caps',
    fontSize: 1,
    px: 3,
    overflow: 'hidden',
    borderRadius: 'round',
    border: '1px solid',
    borderColor: 'secondaryAlt',
    py: 1,
    color: 'secondaryAlt',
    bg: 'surface'
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
  },
  solidCircle: {
    width: '20px',
    height: '20px',
    borderRadius: 'round',
    variant: 'text.caps',
    color: 'onPrimary',
    bg: 'primary',
    border: '1px solid',
    borderColor: 'primary'
  },
  success: {
    variant: 'badges.primary',
    borderColor: 'success',
    color: 'success'
  },
  notice: {
    variant: 'badges.primary',
    borderColor: 'notice',
    color: 'notice'
  },
  warning: {
    variant: 'badges.primary',
    borderColor: 'warning',
    color: 'warning'
  }
};
