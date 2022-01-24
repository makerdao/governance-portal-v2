import { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import { SWRConfig } from 'swr';
import { ThemeProvider, Flex } from 'theme-ui';
import { Global } from '@emotion/core';

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
import { getLibrary } from 'modules/web3/helpers/getLibrary';
import { AccountProvider } from 'modules/app/context/AccountContext';

const Web3ReactProviderDefault = dynamic(() => import('../modules/web3/components/DefaultProvider'), {
  ssr: false
});
export const reportWebVitals = vitalslog;

const MyApp = ({ Component, pageProps }: AppProps): React.ReactElement => {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ReactProviderDefault getLibrary={getLibrary}>
        <ThemeProvider theme={theme}>
          <AccountProvider>
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
          </AccountProvider>
        </ThemeProvider>
      </Web3ReactProviderDefault>
    </Web3ReactProvider>
  );
};

export default MyApp;
