import { AppProps } from 'next/app';
import { SWRConfig } from 'swr';
import { ThemeProvider } from 'theme-ui';

import '@reach/dialog/styles.css';
import '@reach/listbox/styles.css';
import '@reach/menu-button/styles.css';
import '@reach/tabs/styles.css';
import '@reach/tooltip/styles.css';
import { fetchJson } from '../lib/utils';
import theme from '../lib/theme';

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
        <Component {...pageProps} />
      </SWRConfig>
    </ThemeProvider>
  );
};

export default MyApp;
