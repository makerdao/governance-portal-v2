import { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import { SWRConfig } from 'swr';
import { ThemeProvider, Flex } from 'theme-ui';
import { Global } from '@emotion/core';
import { ethers } from 'ethers';
import '@reach/dialog/styles.css';
import '@reach/listbox/styles.css';
import '@reach/menu-button/styles.css';
import '@reach/tabs/styles.css';
import '@reach/tooltip/styles.css';
import { fetchJson } from 'lib/fetchJson';
import theme from 'lib/theme';
import Header from 'modules/app/components/layout/Header';
import Cookies from 'modules/app/components/Cookies';
import { AnalyticsProvider } from 'modules/app/client/analytics/AnalyticsContext';
import { CookiesProvider } from 'modules/app/client/cookies/CookiesContext';
import { HeadComponent } from 'modules/app/components/layout/Head';
import { Web3ReactProvider } from '@web3-react/core';
import { getLibrary } from 'modules/web3/helpers/getLibrary';
import { AccountProvider } from 'modules/app/context/AccountContext';
import NextNprogress from 'nextjs-progressbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BallotProvider } from 'modules/polling/context/BallotContext';
import debug from 'debug';
import Script from 'next/script';
const vitalslog = debug('govpo:vitals');

const Web3ReactProviderDefault = dynamic(() => import('../modules/web3/components/DefaultProvider'), {
  ssr: false
});
export const reportWebVitals = vitalslog;

const MyApp = ({ Component, pageProps }: AppProps): React.ReactElement => {
  ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR);

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ReactProviderDefault getLibrary={getLibrary}>
        {/* @ts-ignore */}
        <ThemeProvider theme={theme}>
          <NextNprogress
            color="#1aab9b"
            startPosition={0.3}
            stopDelayMs={200}
            height={3}
            showOnShallow={true}
            options={{ showSpinner: false }}
          />
          <AccountProvider>
            <BallotProvider>
              <HeadComponent />
              {process.env.NODE_ENV === 'production' && (
                <Script
                  data-goatcounter="https://dux-makerdao.goatcounter.com/count"
                  async
                  src="//gc.zgo.at/count.js"
                  strategy="afterInteractive"
                />
              )}
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
            </BallotProvider>
          </AccountProvider>
          <ToastContainer position="top-right" theme="light" />
        </ThemeProvider>
      </Web3ReactProviderDefault>
    </Web3ReactProvider>
  );
};

export default MyApp;
