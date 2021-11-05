import { AppProps } from 'next/app';
import Head from 'next/head';
import { SWRConfig } from 'swr';
import { ThemeProvider, Flex } from 'theme-ui';
import { Global } from '@emotion/core';

import '@reach/dialog/styles.css';
import '@reach/listbox/styles.css';
import '@reach/menu-button/styles.css';
import '@reach/tabs/styles.css';
import '@reach/tooltip/styles.css';
import { config } from 'lib/config';
import { fetchJson } from 'lib/fetchJson';
import theme from 'lib/theme';
import Header from 'modules/app/components/layout/Header';
import debug from 'debug';
const vitalslog = debug('govpo:vitals');

import { useAccountChange } from 'modules/web3/hooks/useAccountChange';
import Cookies from 'modules/app/components/Cookies';
import { AnalyticsProvider } from 'modules/app/client/analytics/AnalyticsContext';
import { CookiesProvider } from 'modules/app/client/cookies/CookiesContext';
import { HeadComponent } from 'modules/app/components/layout/Head';

export const reportWebVitals = vitalslog;

const MyApp = ({ Component, pageProps }: AppProps): React.ReactElement => {
  const dev = config.NODE_ENV === 'development';
  // Initialize global hooks
  useAccountChange();

  return (
    <ThemeProvider theme={theme}>
      <HeadComponent />
      <Head>
        <meta
          content={`script-src 'self' ${
            dev ? "'unsafe-eval'" : ''
          } 'sha256-a0L6Pfwt+Nftvey0NflqMTGt/tO5UMFmI/PAiNnoYRo=';`}
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
