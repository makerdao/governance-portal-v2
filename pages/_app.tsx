/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { AppProps } from 'next/app';
import { SWRConfig } from 'swr';
import { ThemeUIProvider, Flex, Box } from 'theme-ui';
import { Global } from '@emotion/react';
import '@reach/dialog/styles.css';
import '@reach/listbox/styles.css';
import '@reach/menu-button/styles.css';
import '@reach/tabs/styles.css';
import '@reach/tooltip/styles.css';
import { fetchJson } from 'lib/fetchJson';
import theme from 'lib/theme';
import Header from 'modules/app/components/layout/Header';
import { HeadComponent } from 'modules/app/components/layout/Head';
import { AccountProvider } from 'modules/app/context/AccountContext';
import NextNprogress from 'nextjs-progressbar';
import { ToastContainer } from 'react-toastify';
import { BallotProvider } from 'modules/polling/context/BallotContext';
import debug from 'debug';
import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import { WagmiProvider } from 'wagmi';
import { wagmiConfigDev, wagmiConfigProd } from 'modules/wagmi/config/config.default';
import { mockWagmiConfig } from 'modules/wagmi/config/config.e2e';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeImage } from 'modules/app/components/ThemeImage';
import { useMigrationToast } from 'modules/app/hooks/useMigrationToast';

const vitalslog = debug('govpo:vitals');
export const reportWebVitals = vitalslog;

const App = ({ Component, pageProps }: AppProps): React.ReactElement => {
  const useMockWallet =
    process.env.NEXT_PUBLIC_USE_MOCK_WALLET === 'true' && process.env.NODE_ENV !== 'production';
  const isProduction =
    process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_VERCEL_ENV !== 'development';
  const wagmiConfig = useMockWallet ? mockWagmiConfig : isProduction ? wagmiConfigProd : wagmiConfigDev;
  const queryClient = new QueryClient();

  // Show governance migration toast
  useMigrationToast();

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {/* @ts-expect-error - Incompatible pointer events */}
        <ThemeUIProvider theme={theme}>
          <Analytics />

          <NextNprogress
            color="#504DFF"
            startPosition={0.3}
            stopDelayMs={200}
            height={3}
            showOnShallow={true}
            options={{ showSpinner: false }}
          />
          <AccountProvider>
            <BallotProvider>
              <HeadComponent />
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
                    },
                    '.progress-bar': {
                      background: '#504DFF'
                    }
                  }}
                />

                <Flex
                  sx={{
                    flexDirection: 'column',
                    variant: 'layout.root',

                    paddingTop: '62px',
                    position: 'relative',
                    overflowX: 'hidden'
                  }}
                >
                  <ThemeImage />
                  <Box sx={{ px: [3, 4] }}>
                    <Component {...pageProps} />
                  </Box>
                  <Header />
                </Flex>
              </SWRConfig>
            </BallotProvider>
          </AccountProvider>
          <ToastContainer position="bottom-right" theme="light" aria-label="Toast notifications" />
        </ThemeUIProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
