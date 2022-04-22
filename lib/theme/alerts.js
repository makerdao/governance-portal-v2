export const alerts = {
  primary: {
    fontSize: 2,
    borderRadius: 'small',
    border: '1px solid',
    borderColor: 'primary',
    bg: 'primary',
    color: 'onPrimary',
    width: '100%',
    justifyContent: ['flex-start', 'center']
  },
  success: {
    variant: 'alerts.primary',
    borderColor: 'success',
    bg: 'successAlt',
    color: 'onSuccess'
  },
  notice: {
    variant: 'alerts.primary',
    borderColor: 'notice',
    bg: 'noticeAlt',
    color: 'onNotice'
  },
  warning: {
    variant: 'alerts.primary',
    borderColor: 'warning',
    bg: 'warningAlt',
    color: 'onWarning'
  },
  banner: {
    variant: 'alerts.primary',
    borderRadius: 0,
    bg: 'banner',
    borderColor: 'banner'
  }
};
