import React, { createContext, useContext, useEffect } from 'react';
import { CookiesContext } from '../cookies/CookiesContext';
import { useRouter } from 'next/router';
import { mixpanelInit } from './mixPanel';
import mixpanel from 'mixpanel-browser';

type TrackConfig = {
  id: string,
  product: string,
  page: string
}

type AnalyticsContextType = {
  trackUserEvent: (item: string, config: TrackConfig) => void,
  setUserData: (item: any) => void,
  identifyUser: (account: string) => void,
}

export const AnalyticsContext = createContext<AnalyticsContextType>({
  trackUserEvent: (item: string, config: TrackConfig) => null,
  setUserData: (item: any) => null,
  identifyUser: (item: string) => null,
});

export const AnalyticsProvider = ({ children }: { children: React.ReactElement }): React.ReactElement => {
  const { cookies, accepted } = useContext(CookiesContext);

  const router = useRouter();

  // Only track users that accepted analytics
  function launchAnalytics() {
    if (accepted && cookies.statistics) {
      mixpanelInit();

      // First interaction
      mixpanel.track('Pageview', { product: 'governance-portal-v2' });

      const handleRouteChange = url => {
        mixpanel.track('route-change', {
          id: url,
          product: 'governance-portal-v2'
        });
      };
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


  function trackUserEvent(item: string, config: TrackConfig): void {
    if (cookies.statistics && accepted) {
      mixpanel.track(item, config);
    }
  }

  function identifyUser(user: string): void {
    mixpanel.identify(user);
  }

  function setUserData(data: any): void {
    mixpanel.people.set(data);
  }

  return (
    <AnalyticsContext.Provider value={{
      trackUserEvent,
      identifyUser,
      setUserData
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
};
