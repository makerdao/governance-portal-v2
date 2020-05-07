import React from 'react';
import App from 'next/app';
import theme from '../lib/theme';
import { SWRConfig } from 'swr';
import { ThemeProvider } from 'theme-ui';
import MakerProvider from '../providers/MakerProvider';

class MyApp extends App {
  state = {};

  componentDidMount() {
    this.setState({
      network: window.location.search.includes('kovan') ? 'kovan' : 'mainnet',
    });
  }

  render() {
    const { Component, pageProps } = this.props;
    const { network } = this.state;
    return (
      <MakerProvider network={network}>
        <ThemeProvider theme={theme}>
          <SWRConfig value={{ refreshInterval: 2000 }}>
            <Component {...pageProps} />
          </SWRConfig>
        </ThemeProvider>
      </MakerProvider>
    );
  }
}

export default MyApp;
