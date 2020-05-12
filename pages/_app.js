import React, { useState, useEffect } from 'react';
import theme from '../lib/theme';
import { SWRConfig } from 'swr';
import { ThemeProvider } from 'theme-ui';
import AccountsProvider from '../providers/AccountsProvider';

export function reportWebVitals(metric) {
  console.log(metric);
}

function MyApp({ Component, pageProps }) {
  const [network, setNetwork] = useState();

  useEffect(() => {
    setNetwork(window.location.search.includes('kovan') ? 'kovan' : 'mainnet');
  }, []);

  return (
    <AccountsProvider network={network}>
      <ThemeProvider theme={theme}>
        <SWRConfig value={{ refreshInterval: 2000 }}>
          <Component {...pageProps} network={network} />
        </SWRConfig>
      </ThemeProvider>
    </AccountsProvider>
  );
}

export default MyApp;
