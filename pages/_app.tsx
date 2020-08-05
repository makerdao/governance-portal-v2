import Router from 'next/router';
import { AppProps } from 'next/app';
import { useEffect } from 'react';
import { SWRConfig } from 'swr';
import { ThemeProvider } from 'theme-ui';
import queryString from 'query-string';

import '@reach/dialog/styles.css';
import '@reach/listbox/styles.css';
import '@reach/menu-button/styles.css';
import '@reach/tabs/styles.css';
import '@reach/tooltip/styles.css';
import { fetchJson } from '../lib/utils';
import theme from '../lib/theme';
import { getNetwork } from '../lib/maker';

export function reportWebVitals(metric) {
  console.log(metric);
}

const MyApp = ({ Component, pageProps }: AppProps) => {
  const currentNetwork = getNetwork();

  useEffect(() => {
    // if the network is changed in the url, reload the page
    Router.events.on('routeChangeComplete', url => {
      const newNetwork = queryString.parse(url.replace('/', ''))?.network;
      if (newNetwork && newNetwork !== currentNetwork) {
        Router.reload();
      }
    });

    // if the network is specified in the url, set as global
    console.log('hello im here lol');
    (global as any).__TESTNET__ = !!window.location.search.includes('testnet');
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <SWRConfig
        value={{
          refreshInterval: 2000,
          fetcher: url => fetchJson(url)
        }}
      >
        <Component {...pageProps} />
      </SWRConfig>
    </ThemeProvider>
  );
};

export default MyApp;
