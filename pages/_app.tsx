import { AppProps } from 'next/app';
import { SWRConfig } from 'swr';
import { ThemeProvider, Flex, Text } from 'theme-ui';
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
import { AccountProvider } from 'modules/app/context/AccountContext';
import NextNprogress from 'nextjs-progressbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BallotProvider } from 'modules/polling/context/BallotContext';
import debug from 'debug';
import Script from 'next/script';
import Banner from 'modules/app/components/layout/header/Banner';
import bannerContent from 'modules/home/data/bannerContent.json';
import { MigrationBanner } from 'modules/migration/components/MigrationBanner';
import { Web3Provider } from 'modules/web3/components/Web3Provider';
import { ExternalLink } from 'modules/app/components/ExternalLink';
import { Icon } from '@makerdao/dai-ui-icons';

const vitalslog = debug('govpo:vitals');
export const reportWebVitals = vitalslog;

const App = ({ Component, pageProps }: AppProps): React.ReactElement => {
  ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR);

  const activeBannerContent = bannerContent.find(({ active }) => active === true);

  return (
    <Web3Provider>
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
                  {activeBannerContent && <Banner content={activeBannerContent.content} />}
                  <MigrationBanner />
                  <Banner
                    variant={'primary'}
                    content={
                      <ExternalLink
                        href="https://makerdao.com"
                        title="Learn more about gasless voting"
                        styles={{ color: 'inherit' }}
                      >
                        <Text sx={{ display: 'flex', alignItems: 'center' }}>
                          <Icon name="lightningBolt" size={3} /> Poll voting is now gasless. <b>Learn more</b>
                          <Icon name="chevron_right" size={2} ml={2} />
                        </Text>
                      </ExternalLink>
                    }
                  />
                  <Flex
                    sx={{
                      flexDirection: 'column',
                      variant: 'layout.root',
                      px: [3, 4],
                      overflowX: 'hidden'
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
    </Web3Provider>
  );
};

export default App;
