import mixpanel from 'mixpanel-browser';
const PRODUCT = 'governance-portal-v2';

type MixpanelTrackFunctions = {
  trackBtnClick: (id: string) => void;
  trackInputChange: (id: string) => void;
};

export const useAnalytics = (page: string): MixpanelTrackFunctions => {
  const trackBtnClick = (id: string): void => {
    mixpanel.track('btn-click', {
      id,
      product: PRODUCT,
      page
    });
  };
  const trackInputChange = (id: string): void => {
    mixpanel.track('input-change', {
      id,
      product: PRODUCT,
      page
    });
  };

  return { trackBtnClick, trackInputChange };
};
