import { useContext } from 'react';
import { ANALYTICS_EVENTS, ANALYTICS_PRODUCT } from './analytics.constants';
import { AnalyticsContext } from './AnalyticsContext';

type MixpanelTrackFunctions = {
  trackButtonClick: (id: string) => void;
  trackInputChange: (id: string) => void;
};

export const useAnalytics = (page: string): MixpanelTrackFunctions => {
  const { emitAnalyticsEvent } = useContext(AnalyticsContext);

  const trackButtonClick = (id: string): void => {
    emitAnalyticsEvent(ANALYTICS_EVENTS.BUTTON_CLICK, {
      id,
      product: ANALYTICS_PRODUCT,
      page
    });
  };

  const trackInputChange = (id: string): void => {
    emitAnalyticsEvent(ANALYTICS_EVENTS.INPUT_CHANGE, {
      id,
      product: ANALYTICS_PRODUCT,
      page
    });
  };

  return { trackButtonClick, trackInputChange };
};
