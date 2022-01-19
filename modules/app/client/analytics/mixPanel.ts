import mixpanel from 'mixpanel-browser';
import { config } from '../../../../lib/config';

const analyticsConfig = {
  development: {
    mixpanel: {
      token: config.MIXPANEL_DEV,
      config: { debug: true, ip: false, api_host: 'https://api.mixpanel.com' }
    }
  },
  production: {
    mixpanel: {
      token: config.MIXPANEL_PROD,
      config: { ip: false, api_host: 'https://api.mixpanel.com' }
    }
  }
}[config.NODE_ENV];

export const mixpanelTokenConfigured = analyticsConfig?.mixpanel?.token !== '';

export const mixpanelInit = (): void => {
  if (analyticsConfig.mixpanel.token) {
    console.debug(
      `[Mixpanel] Tracking initialized for ${config.NODE_ENV} env using ${analyticsConfig.mixpanel.token}`
    );
    mixpanel.init(analyticsConfig.mixpanel.token, analyticsConfig.mixpanel.config);
  } else {
    console.debug('Mixpanel not inialized');
  }
};
