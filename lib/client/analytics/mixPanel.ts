import mixpanel from 'mixpanel-browser';
import { config } from '../../config';

const analyticsConfig = {
  development: {
    mixpanel: {
      token: '4ff3f85397ffc3c6b6f0d4120a4ea40a',
      config: { debug: true, ip: false, api_host: 'https://api.mixpanel.com' }
    }
  },
  production: {
    mixpanel: {
      token: 'a030d8845e34bfdc11be3d9f3054ad67',
      config: { ip: false, api_host: 'https://api.mixpanel.com' }
    }
  }
}[config.NODE_ENV];

export const mixpanelInit = (): void => {
  console.debug(
    `[Mixpanel] Tracking initialized for ${config.NODE_ENV} env using ${analyticsConfig.mixpanel.token}`
  );
  mixpanel.init(analyticsConfig.mixpanel.token, analyticsConfig.mixpanel.config);
};
