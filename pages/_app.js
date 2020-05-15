import Router from 'next/router';
import { useEffect } from 'react';
import { SWRConfig } from 'swr';
import { ThemeProvider } from 'theme-ui';
import queryString from 'query-string';

import theme from '../lib/theme';
import { getNetwork } from '../lib/maker';

export function reportWebVitals(metric) {
  console.log(metric);
}

function MyApp({ Component, pageProps }) {
  const currentNetwork = getNetwork();

  useEffect(() => {
    // if the network is changed in the url, reload the page
    Router.events.on('routeChangeComplete', url => {
      const newNetwork = queryString.parse(url.replace('/', ''))?.network;
      if (newNetwork && newNetwork !== currentNetwork) {
        Router.reload();
      }
    });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <SWRConfig value={{ refreshInterval: 2000 }}>
        <Component {...pageProps} />
      </SWRConfig>
    </ThemeProvider>
  );
}

export default MyApp;
