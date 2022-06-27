import { localStorage } from 'modules/app/client/storage/localStorage';
import React, { createContext, useEffect, useState } from 'react';

type CookiesType = {
  statistics: boolean;
  functional: boolean;
};

export const CookiesContext = createContext<{
  accepted: boolean;
  loaded: boolean;
  accept: (val: CookiesType) => void;
  cookies: CookiesType;
  setCookies: (val: CookiesType) => void;
}>({
  accepted: false,
  loaded: false,
  accept: () => null,
  cookies: {
    statistics: true,
    functional: true
  },
  setCookies: () => null
});

export const CookiesProvider = ({
  disabled,
  children
}: {
  disabled: boolean;
  children: React.ReactElement;
}): React.ReactElement => {
  const [accepted, setAccepted] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const [cookies, setStateCookies] = useState({
    functional: true,
    statistics: true
  });

  const accept = cookiesObject => {
    setAccepted(true);
    localStorage.set('cookies', JSON.stringify({ accepted: true, cookies: cookiesObject, date: Date.now() }));
  };

  // Load previous cookies storage
  useEffect(() => {
    if (!disabled) {
      // Logic for checking if the user accepted the cookies before
      const prevCookies = localStorage.get('cookies', true);
      setAccepted(prevCookies ? prevCookies.accepted : false);
      setStateCookies(prevCookies && prevCookies.cookies ? prevCookies.cookies : cookies);
      setLoaded(true);
    } else {
      // The context is disabled (for testing or server side)
      setStateCookies({
        functional: false,
        statistics: false
      });
      setLoaded(true);
      setAccepted(true);
    }
  }, []);

  const setCookies = (val: CookiesType) => {
    setStateCookies(val);
  };

  return (
    <CookiesContext.Provider value={{ accepted, loaded, accept, cookies, setCookies }}>
      {children}
    </CookiesContext.Provider>
  );
};
