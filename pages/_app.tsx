import { AppProps } from 'next/app';
import { SWRConfig } from 'swr';
import { ThemeProvider, Flex } from 'theme-ui';
import { Global } from '@emotion/core';
import { Provider as UrqlProvider } from 'urql';
import { client, ssrCache } from 'modules/gql/client';

import '@reach/dialog/styles.css';
import '@reach/listbox/styles.css';
import '@reach/menu-button/styles.css';
import '@reach/tabs/styles.css';
import '@reach/tooltip/styles.css';
import { fetchJson } from 'lib/fetchJson';
import theme from 'lib/theme';
import Header from 'modules/app/components/layout/Header';
import debug from 'debug';
const vitalslog = debug('govpo:vitals');

import Cookies from 'modules/app/components/Cookies';
import { AnalyticsProvider } from 'modules/app/client/analytics/AnalyticsContext';
import { CookiesProvider } from 'modules/app/client/cookies/CookiesContext';
import { HeadComponent } from 'modules/app/components/layout/Head';
import { Web3ReactProvider } from '@web3-react/core';
import { getLibrary } from 'modules/web3/helpers';

export const reportWebVitals = vitalslog;

const MyApp = ({ Component, pageProps }: AppProps): React.ReactElement => {
  // TODO: come back to this
  if (pageProps.urqlState) {
    ssrCache.restoreData(pageProps.urqlState);
  }

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <UrqlProvider value={client}>
        <ThemeProvider theme={theme}>
          <HeadComponent />
          <CookiesProvider disabled={false}>
            <AnalyticsProvider>
              <SWRConfig
                value={{
                  // default to 60 second refresh intervals
                  refreshInterval: 60000,
                  revalidateOnMount: true,
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
      </UrqlProvider>
    </Web3ReactProvider>
  );
};

export default MyApp;
