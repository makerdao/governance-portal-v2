import { AppProps } from 'next/app';
import { SWRConfig } from 'swr';
import { ThemeProvider, Flex } from 'theme-ui';
import { Global } from '@emotion/core';

import '@reach/dialog/styles.css';
import '@reach/listbox/styles.css';
import '@reach/menu-button/styles.css';
import '@reach/tabs/styles.css';
import '@reach/tooltip/styles.css';
import { fetchJson } from '../lib/utils';
import theme from '../lib/theme';
import Header from '../components/Header';

export function reportWebVitals(metric) {
  console.log(metric);
}

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <ThemeProvider theme={theme}>
      <SWRConfig
        value={{
          refreshInterval: 2000,
          fetcher: url => fetchJson(url)
        }}
      >
        <Global
          styles={{
            '*': {
              '-webkit-font-smoothing': 'antialiased',
              '-moz-osx-font-smoothing': 'grayscale'
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
        </Flex>
      </SWRConfig>
    </ThemeProvider>
  );
};

export default MyApp;
