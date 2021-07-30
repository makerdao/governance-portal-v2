import { AppProps } from 'next/app';
import { SWRConfig } from 'swr';
import { ThemeProvider, Flex } from 'theme-ui';
import { Global } from '@emotion/core';

import '@reach/dialog/styles.css';
import '@reach/listbox/styles.css';
import '@reach/menu-button/styles.css';
import '@reach/tabs/styles.css';
import '@reach/tooltip/styles.css';
import { fetchJson } from 'lib/utils';
import theme from 'lib/theme';
import Header from 'components/Header';
import Head from 'next/head';
import debug from 'debug';
const vitalslog = debug('govpo:vitals');

import { config } from '../lib/config';
import { useAccountChange } from 'lib/web3/hooks/useAccountChange';
import Cookies from 'components/Cookies';
import { AnalyticsProvider } from 'lib/client/analytics/AnalyticsContext';
import { CookiesProvider } from 'lib/client/cookies/CookiesContext';

export const reportWebVitals = vitalslog;

const MyApp = ({ Component, pageProps }: AppProps): React.ReactElement => {
  const dev = config.NODE_ENV === 'development';

  // Initialize global hooks
  useAccountChange();

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <meta
          httpEquiv="Content-Security-Policy"
          content={
            "default-src 'none';" +
            'frame-src https://connect.trezor.io;' +
            "font-src 'self';" +
            "connect-src 'self' https: wss:;" +
            "style-src 'self' 'unsafe-inline';" +
            `script-src 'self' ${dev ? "'unsafe-eval'" : ''};` +
            "img-src 'self' https: data:"
          }
        />
        <meta
          name="description"
          content="MakerDAO stakeholders use the Voting Portal to vote on the blockchain. Voting occurs frequently, requiring an active, well-informed governance community."
        />
      </Head>
      <CookiesProvider disabled={false}>
        <AnalyticsProvider>
          <SWRConfig
            value={{
              refreshInterval: 5000,
              fetcher: url => fetchJson(url)
            }}
          >
            <Global
              styles={{
                '*': {
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale'
                }
              }}
            />
            <Flex
              sx={{
                flexDirection: 'column',
                variant: 'layout.root',
                px: [3, 4]
              }}
            >
              <Header />
              <Component {...pageProps} />
              <Cookies />
            </Flex>
          </SWRConfig>
        </AnalyticsProvider>
      </CookiesProvider>
    </ThemeProvider>
  );
};

export default MyApp;
