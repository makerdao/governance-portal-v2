import React, { createContext, useContext, useEffect } from 'react';
import { CookiesContext } from '../cookies/CookiesContext';
import { useRouter } from 'next/router';
// import { mixpanelInit, mixpanelTokenConfigured } from './mixPanel';
// import mixpanel from 'mixpanel-browser';
import { ANALYTICS_EVENTS, ANALYTICS_PRODUCT } from './analytics.constants';
import { goatcounterTrack } from './goatcounter';

declare global {
  interface Window {
    goatcounter: any;
  }
}

type TrackConfig = {
  id: string;
  product: string;
  page: string;
};

type AnalyticsContextType = {
  emitAnalyticsEvent: (item: string, config: TrackConfig) => void;
  setUserData: (item: any) => void;
  identifyUser: (account: string) => void;
};

export const AnalyticsContext = createContext<AnalyticsContextType>({
  emitAnalyticsEvent: (item: string, config: TrackConfig) => null,
  setUserData: (item: any) => null,
  identifyUser: (item: string) => null
});

export const AnalyticsProvider = ({ children }: { children: React.ReactElement }): React.ReactElement => {
  const { cookies, accepted } = useContext(CookiesContext);

  const analyticCookiesEnabled = cookies.statistics && accepted; //&& mixpanelTokenConfigured;

  const router = useRouter();

  // Only track users that accepted analytics
  function launchAnalytics() {
    if (analyticCookiesEnabled) {
      // mixpanelInit();

      // First interaction
      // mixpanel.track('Pageview', { product: ANALYTICS_PRODUCT });

      const handleRouteChange = url => {
        // mixpanel.track(ANALYTICS_EVENTS.ROUTE_CHANGE, {
        //   id: url,
        //   product: ANALYTICS_PRODUCT
        // });

        goatcounterTrack(url.slice(1), ANALYTICS_EVENTS.ROUTE_CHANGE, false);
      };

      // Subscribe to route event changes and emit
      router.events.on('routeChangeStart', handleRouteChange);

      return () => {
        router.events.off('routeChangeStart', handleRouteChange);
      };
    }
  }

  useEffect(() => {
    launchAnalytics();
  }, []);

  useEffect(() => {
    launchAnalytics();
  }, [accepted]);

  // Mixpanel implementation protected by user cookies enabled or not
  function emitAnalyticsEvent(event: string, config: TrackConfig): void {
    if (analyticCookiesEnabled) {
      // mixpanel.track(event, config);
      goatcounterTrack(config.page, event);
    }
  }

  function identifyUser(user: string): void {
    if (analyticCookiesEnabled) {
      // mixpanel.identify(user);
    }
  }

  function setUserData(data: any): void {
    if (analyticCookiesEnabled) {
      // mixpanel.people.set(data);
    }
  }

  return (
    <AnalyticsContext.Provider
      value={{
        emitAnalyticsEvent,
        identifyUser,
        setUserData
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};
